<template>
	<view class="page-container" :class="{ 'dark-mode': isDarkMode }">
		<!-- 顶部导航栏 -->
		<view class="nav-bar">
			<view class="nav-left" @tap="goBack">
				<text class="icon">←</text>
			</view>
			<view class="nav-title">成就中心</view>
			<view class="nav-right"></view>
		</view>

		<!-- 成就统计卡片 -->
		<view class="stats-card">
			<view class="stats-header">
				<view class="stats-info">
					<text class="stats-title">{{ currentBabyName }}</text>
					<text class="stats-subtitle">已解锁 {{ unlockedCount }} / {{ totalCount }} 成就</text>
				</view>
				<view class="completion-rate">
					<text class="rate-value">{{ completionRate }}%</text>
					<text class="rate-label">完成率</text>
				</view>
			</view>
			<view class="progress-bar">
				<view class="progress-fill" :style="{ width: completionRate + '%' }"></view>
			</view>
		</view>

		<!-- 类别筛选 -->
		<view class="category-tabs">
			<view 
				class="tab-item" 
				:class="{ active: activeCategory === 'all' }"
				@tap="switchCategory('all')"
			>
				<text>全部</text>
			</view>
			<view 
				class="tab-item" 
				:class="{ active: activeCategory === 'task' }"
				@tap="switchCategory('task')"
			>
				<text>任务</text>
			</view>
			<view 
				class="tab-item" 
				:class="{ active: activeCategory === 'streak' }"
				@tap="switchCategory('streak')"
			>
				<text>坚持</text>
			</view>
			<view 
				class="tab-item" 
				:class="{ active: activeCategory === 'points' }"
				@tap="switchCategory('points')"
			>
				<text>积分</text>
			</view>
			<view 
				class="tab-item" 
				:class="{ active: activeCategory === 'shop' }"
				@tap="switchCategory('shop')"
			>
				<text>商城</text>
			</view>
		</view>

		<!-- 成就列表 -->
		<view class="achievement-list">
			<view 
				class="achievement-item" 
				:class="{ locked: !item.unlocked }"
				v-for="item in filteredAchievements" 
				:key="item.id"
			>
				<view class="achievement-icon" :class="{ locked: !item.unlocked }">
					<text class="icon-emoji">{{ item.icon }}</text>
					<view v-if="!item.unlocked" class="lock-overlay">🔒</view>
				</view>
				<view class="achievement-info">
					<view class="achievement-header">
						<text class="achievement-name">{{ item.name }}</text>
						<view v-if="item.unlocked && item.pointsAwarded" class="achievement-points">
							+{{ item.pointsAwarded }}
						</view>
						<view v-else class="achievement-points locked-points">
							{{ getRequiredByType(item) }}
						</view>
					</view>
					<text class="achievement-desc">{{ item.description }}</text>
					<view v-if="item.unlocked && item.unlockedAt" class="achievement-time">
						{{ formatTime(item.unlockedAt) }} 解锁
					</view>
					<view v-else class="achievement-progress">
						<text class="progress-text">{{ getProgressText(item) }}</text>
					</view>
				</view>
				<view class="achievement-rare" :class="'rare-' + item.rare">
					<text>{{ getRareText(item.rare) }}</text>
				</view>
			</view>
		</view>

		<!-- 空状态 -->
		<view v-if="filteredAchievements.length === 0" class="empty-state">
			<text class="empty-text">暂无成就</text>
		</view>

		<!-- 解锁提示弹窗 -->
		<view class="unlock-modal" v-if="showUnlockModal" @tap="closeUnlockModal">
			<view class="unlock-content" @tap.stop>
				<view class="unlock-header">
					<text class="unlock-title">🎉 成就解锁！</text>
				</view>
				<view class="unlock-achievement">
					<view class="unlock-icon">{{ newUnlockAchievement.icon }}</view>
					<text class="unlock-name">{{ newUnlockAchievement.name }}</text>
					<text class="unlock-desc">{{ newUnlockAchievement.description }}</text>
				</view>
				<view class="unlock-reward" v-if="newUnlockAchievement.pointsAwarded">
					<text>奖励：+{{ newUnlockAchievement.pointsAwarded }} 积分</text>
				</view>
				<button class="unlock-btn" @tap="closeUnlockModal">我知道了</button>
			</view>
		</view>
	</view>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { isDarkTheme } from '@/utils/themeUtils.js'
import { useAchievementStore } from '@/stores/achievementStore'
import { useBabyStore } from '@/stores/babyStore'
import { usePointsStore } from '@/stores/pointsStore'

export default {
	name: 'AchievementList',
	setup() {
		const isDarkMode = ref(false)
		const achievementStore = useAchievementStore()
		const babyStore = useBabyStore()
		const pointsStore = usePointsStore()
		const activeCategory = ref('all')
		const showUnlockModal = ref(false)
		const newUnlockAchievement = ref({})

		// 当前宝宝名称
		const currentBabyName = computed(() => {
			return babyStore.currentBabyName || '未选择宝宝'
		})

		// 所有成就列表
		const allAchievements = computed(() => {
			return achievementStore.currentBabyAchievements
		})

		// 筛选后的成就列表
		const filteredAchievements = computed(() => {
			if (activeCategory.value === 'all') {
				return allAchievements.value
			}
			return allAchievements.value.filter(a => a.category === activeCategory.value)
		})

		// 已解锁数量
		const unlockedCount = computed(() => {
			return achievementStore.currentBabyUnlockedCount
		})

		// 总数量
		const totalCount = computed(() => {
			return achievementStore.currentBabyTotalCount
		})

		// 完成率
		const completionRate = computed(() => {
			const stats = achievementStore.currentBabyStats
			return stats ? stats.completionRate : 0
		})

		// 切换分类
		const switchCategory = (category) => {
			activeCategory.value = category
		}

		// 获取稀有度文字
		const getRareText = (rare) => {
			const rareMap = { 1: '普通', 2: '稀有', 3: '传说' }
			return rareMap[rare] || '普通'
		}

		// 获取各类型成就的需求文字
		const getRequiredByType = (achievement) => {
			const condition = achievement.condition
			switch (condition.type) {
				case 'task_complete':
					return `需${condition.count}个任务`
				case 'task_streak':
					return `需连续${condition.count}天`
				case 'points_earned':
					return `需${condition.count}积分`
				case 'exchange_complete':
					return `需兑换${condition.count}次`
				case 'baby_added':
					return `需添加${condition.count}个宝宝`
				default:
					return ''
			}
		}

		// 获取进度文字
		const getProgressText = (achievement) => {
			const babyId = babyStore.currentBabyId
			if (!babyId) return ''

			const condition = achievement.condition
			switch (condition.type) {
				case 'task_complete':
					const taskCount = achievementStore.taskCountByBaby[babyId] || 0
					return `${taskCount}/${condition.count}`
				case 'task_streak':
					const streak = achievementStore.streakByBaby[babyId]?.count || 0
					return `${streak}/${condition.count}天`
				case 'points_earned':
					const totalPoints = achievementStore.totalPointsByBaby[babyId] || 0
					return `${totalPoints}/${condition.count}`
				case 'exchange_complete':
					const exchangeCount = achievementStore.exchangeCountByBaby[babyId] || 0
					return `${exchangeCount}/${condition.count}`
				case 'baby_added':
					return `${babyStore.babies.length}/${condition.count}`
				default:
					return ''
			}
		}

		// 格式化时间
		const formatTime = (timeStr) => {
			if (!timeStr) return ''
			const date = new Date(timeStr)
			const month = date.getMonth() + 1
			const day = date.getDate()
			return `${month}月${day}日`
		}

		// 返回上一页
		const goBack = () => {
			uni.navigateBack()
		}

		// 关闭解锁弹窗
		const closeUnlockModal = () => {
			showUnlockModal.value = false
		}

		// 处理成就解锁事件
		const handleAchievementUnlocked = (data) => {
			const babyId = babyStore.currentBabyId
			if (data.babyId === babyId) {
				newUnlockAchievement.value = data.achievement
				showUnlockModal.value = true
			}
		}

		onMounted(() => {
			isDarkMode.value = isDarkTheme()
			achievementStore.init()
			babyStore.loadBabies()

			// 监听成就解锁事件
			uni.$on('achievementUnlocked', handleAchievementUnlocked)
		})

		onUnmounted(() => {
			uni.$off('achievementUnlocked', handleAchievementUnlocked)
		})

		return {
			isDarkMode,
			activeCategory,
			currentBabyName,
			filteredAchievements,
			unlockedCount,
			totalCount,
			completionRate,
			showUnlockModal,
			newUnlockAchievement,
			switchCategory,
			getRareText,
			getRequiredByType,
			getProgressText,
			formatTime,
			goBack,
			closeUnlockModal
		}
	}
}
</script>

<style scoped>
.page-container {
	min-height: 100vh;
	background-color: #f5f5f5;
	padding-bottom: 50px;
}

.dark-mode {
	background-color: #1a1a1a;
	color: #ffffff;
}

.nav-bar {
	display: flex;
	align-items: center;
	height: 88rpx;
	background: linear-gradient(135deg, #8B5CF6, #7C3AED);
	padding: 90rpx 40rpx 60rpx 40rpx;
	position: relative;
}

.nav-left {
	position: absolute;
	left: 30rpx;
	z-index: 1;
}

.icon {
	color: white;
	font-size: 48rpx;
	font-weight: bold;
}

.nav-title {
	flex: 1;
	text-align: center;
	color: white;
	font-size: 48rpx;
	font-weight: bold;
}

.nav-right {
	position: absolute;
	right: 30rpx;
}

/* 统计卡片 */
.stats-card {
	margin: 20rpx;
	padding: 30rpx;
	background: linear-gradient(135deg, #8B5CF6, #7C3AED);
	border-radius: 20rpx;
	color: #fff;
}

.stats-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 20rpx;
}

.stats-title {
	font-size: 36rpx;
	font-weight: bold;
	display: block;
}

.stats-subtitle {
	font-size: 24rpx;
	opacity: 0.8;
	display: block;
	margin-top: 8rpx;
}

.completion-rate {
	text-align: center;
}

.rate-value {
	font-size: 48rpx;
	font-weight: bold;
	display: block;
}

.rate-label {
	font-size: 22rpx;
	opacity: 0.8;
}

.progress-bar {
	height: 12rpx;
	background-color: rgba(255, 255, 255, 0.3);
	border-radius: 6rpx;
	overflow: hidden;
}

.progress-fill {
	height: 100%;
	background-color: #FFD700;
	border-radius: 6rpx;
	transition: width 0.3s ease;
}

/* 分类标签 */
.category-tabs {
	display: flex;
	padding: 20rpx;
	background-color: #fff;
	margin: 0 20rpx;
	border-radius: 16rpx;
}

.dark-mode .category-tabs {
	background-color: #2a2a2a;
}

.tab-item {
	flex: 1;
	text-align: center;
	padding: 16rpx 0;
	font-size: 28rpx;
	color: #666;
	position: relative;
}

.dark-mode .tab-item {
	color: #999;
}

.tab-item.active {
	color: #8B5CF6;
	font-weight: bold;
}

.tab-item.active::after {
	content: '';
	position: absolute;
	bottom: 0;
	left: 50%;
	transform: translateX(-50%);
	width: 40rpx;
	height: 6rpx;
	background-color: #8B5CF6;
	border-radius: 3rpx;
}

/* 成就列表 */
.achievement-list {
	padding: 20rpx;
}

.achievement-item {
	display: flex;
	align-items: center;
	background-color: #fff;
	border-radius: 16rpx;
	padding: 24rpx;
	margin-bottom: 16rpx;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.dark-mode .achievement-item {
	background-color: #2a2a2a;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.2);
}

.achievement-item.locked {
	opacity: 0.7;
}

.achievement-icon {
	width: 100rpx;
	height: 100rpx;
	border-radius: 20rpx;
	background: linear-gradient(135deg, #8B5CF6, #7C3AED);
	display: flex;
	align-items: center;
	justify-content: center;
	position: relative;
	flex-shrink: 0;
}

.achievement-icon.locked {
	background: linear-gradient(135deg, #999, #666);
}

.icon-emoji {
	font-size: 48rpx;
}

.lock-overlay {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: rgba(0, 0, 0, 0.3);
	border-radius: 20rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 28rpx;
}

.achievement-info {
	flex: 1;
	margin-left: 20rpx;
}

.achievement-header {
	display: flex;
	align-items: center;
	margin-bottom: 8rpx;
}

.achievement-name {
	font-size: 32rpx;
	font-weight: bold;
	color: #333;
}

.dark-mode .achievement-name {
	color: #fff;
}

.achievement-points {
	font-size: 22rpx;
	color: #8B5CF6;
	background-color: rgba(139, 92, 246, 0.1);
	padding: 4rpx 12rpx;
	border-radius: 16rpx;
	margin-left: 12rpx;
}

.achievement-points.locked-points {
	color: #999;
	background-color: rgba(153, 153, 153, 0.1);
}

.dark-mode .achievement-points.locked-points {
	background-color: rgba(153, 153, 153, 0.2);
}

.achievement-desc {
	font-size: 24rpx;
	color: #666;
	display: block;
}

.dark-mode .achievement-desc {
	color: #999;
}

.achievement-time {
	font-size: 22rpx;
	color: #8B5CF6;
	margin-top: 8rpx;
}

.achievement-progress {
	margin-top: 8rpx;
}

.progress-text {
	font-size: 22rpx;
	color: #999;
}

.achievement-rare {
	padding: 6rpx 12rpx;
	border-radius: 8rpx;
	font-size: 20rpx;
	margin-left: 12rpx;
}

.achievement-rare.rare-1 {
	background-color: rgba(150, 150, 150, 0.2);
	color: #999;
}

.achievement-rare.rare-2 {
	background-color: rgba(59, 130, 246, 0.2);
	color: #3b82f6;
}

.achievement-rare.rare-3 {
	background-color: rgba(245, 158, 11, 0.2);
	color: #f59e0b;
}

/* 空状态 */
.empty-state {
	display: flex;
	justify-content: center;
	align-items: center;
	height: 300rpx;
}

.empty-text {
	color: #999;
	font-size: 28rpx;
}

/* 解锁弹窗 */
.unlock-modal {
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: rgba(0, 0, 0, 0.5);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 1000;
}

.unlock-content {
	width: 600rpx;
	background-color: #fff;
	border-radius: 24rpx;
	padding: 40rpx;
	text-align: center;
}

.dark-mode .unlock-content {
	background-color: #2a2a2a;
}

.unlock-header {
	margin-bottom: 30rpx;
}

.unlock-title {
	font-size: 40rpx;
	font-weight: bold;
	color: #8B5CF6;
}

.unlock-achievement {
	margin-bottom: 20rpx;
}

.unlock-icon {
	font-size: 80rpx;
	margin-bottom: 16rpx;
}

.unlock-name {
	font-size: 36rpx;
	font-weight: bold;
	color: #333;
	display: block;
}

.dark-mode .unlock-name {
	color: #fff;
}

.unlock-desc {
	font-size: 26rpx;
	color: #666;
	display: block;
	margin-top: 8rpx;
}

.dark-mode .unlock-desc {
	color: #999;
}

.unlock-reward {
	font-size: 28rpx;
	color: #8B5CF6;
	background-color: rgba(139, 92, 246, 0.1);
	padding: 16rpx;
	border-radius: 12rpx;
	margin: 20rpx 0;
}

.unlock-btn {
	background: linear-gradient(135deg, #8B5CF6, #7C3AED);
	color: #fff;
	font-size: 32rpx;
	padding: 20rpx;
	border-radius: 40rpx;
	border: none;
	margin-top: 20rpx;
}
</style>