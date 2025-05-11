<template>
	<view class="page-container" :class="{'dark-mode': isDarkMode}">
		<!-- 用户信息区域 -->
		<view class="user-info">
			<view class="avatar-section">
				<image class="avatar" :src="userInfo.avatar || '/static/avatar.svg'" mode="aspectFill"></image>
				<view class="user-details">
					<text class="nickname">{{ userInfo.nickname || '未设置昵称' }}</text>
					<text class="user-id">ID: {{ userInfo.id || '未设置ID' }}</text>
				</view>
			</view>
			<view class="points-info">
				<text class="points-label">当前积分</text>
				<text class="points-value">{{ totalScore }}</text>
			</view>
		</view>

		<!-- 功能列表 -->
		<view class="function-list">
			<view class="function-item" @tap="navigateTo('task/task-records')">
				<text class="icon">📋</text>
				<text class="label">任务记录</text>
				<text class="arrow">></text>
			</view>
			<view class="function-item" @tap="navigateTo('shop/exchange-records')">
				<text class="icon">🛍️</text>
				<text class="label">兑换记录</text>
				<text class="arrow">></text>
			</view>
			<!-- <view class="function-item" @tap="navigateTo('favorites')">
				<text class="icon">⭐</text>
				<text class="label">我的收藏</text>
				<text class="arrow">></text>
			</view> -->
			<view class="function-item" @tap="navigateTo('settings/settings')">
				<text class="icon">⚙️</text>
				<text class="label">设置</text>
				<text class="arrow">></text>
			</view>
		</view>
	</view>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';
import { isDarkTheme } from '@/utils/themeUtils.js';
import { useThemeStore } from '@/stores/theme';
import { getTotalPoints } from '@/utils/pointsManager';

export default {
	name: 'Profile',
	setup() {
		const userInfo = ref({
			avatar: '',
			nickname: '',
			id: ''
		});
		const totalScore = ref(0);
		const isDark = ref(false);
		const themeStore = useThemeStore();
		const taskRecords = ref([]);
		const exchangeRecords = ref([]);

		// 加载用户信息
		const loadUserInfo = () => {
			try {
				const user = uni.getStorageSync('userInfo');
				if (user) {
					userInfo.value = JSON.parse(user);
				}
			} catch (e) {
				console.error('加载用户信息失败:', e);
			}
		};

		// 更新积分显示
		const updatePoints = () => {
			totalScore.value = getTotalPoints();
		};

		// 加载任务记录
		const loadTaskRecords = () => {
			try {
				const records = uni.getStorageSync('taskList') || '[]';
				taskRecords.value = JSON.parse(records)
					.filter(task => task.status === 'completed')
					.slice(0, 3)
					.map(task => ({
						title: task.title,
						action: '完成任务',
						date: task.completedAt || new Date().toISOString(),
						status: '已完成'
					}));
			} catch (e) {
				console.error('加载任务记录失败', e);
			}
		};

		// 加载兑换记录
		const loadExchangeRecords = () => {
			try {
				const records = uni.getStorageSync('exchangeHistory') || '[]';
				exchangeRecords.value = JSON.parse(records)
					.slice(0, 3)
					.map(record => ({
						title: record.productName,
						action: '兑换商品',
						date: record.exchangeTime,
						status: '兑换成功'
					}));
			} catch (e) {
				console.error('加载兑换记录失败', e);
			}
		};

		// 页面跳转
		const navigateTo = (page) => {
			uni.navigateTo({
				url: `/pages/${page}`
			});
		};

		onMounted(() => {
			loadUserInfo();
			loadTaskRecords();
			loadExchangeRecords();
			updatePoints();
			isDark.value = isDarkTheme();

			// 初始化主题
			if (themeStore.initTheme) {
				themeStore.initTheme();
			}

			// 添加积分更新事件监听
			uni.$on('pointsUpdated', updatePoints);
		});

		onUnmounted(() => {
			// 移除事件监听
			uni.$off('pointsUpdated');
		});

		return {
			userInfo,
			totalScore,
			isDark,
			navigateTo,
			taskRecords,
			exchangeRecords
		};
	}
};
</script>

<style>
.profile-container {
	min-height: 100vh;
	background-color: #f5f5f5;
	padding-bottom: 100rpx;
}

.user-info {
	background: linear-gradient(135deg, #8B5CF6, #7C3AED);
	padding: 40rpx 30rpx 30rpx;
	color: white;
	position: relative;
  	border-radius: 0 0 30rpx 30rpx;
  	box-shadow: 0 4rpx 20rpx rgba(124, 58, 237, 0.3);
}

.avatar-section {
	display: flex;
	align-items: center;
	margin-bottom: 30rpx;
}

.avatar {
	width: 120rpx;
	height: 120rpx;
	border-radius: 60rpx;
	margin-right: 20rpx;
	border: 4rpx solid rgba(255, 255, 255, 0.3);
}

.user-details {
	flex: 1;
}

.nickname {
	font-size: 36rpx;
	font-weight: bold;
	margin-bottom: 10rpx;
	display: block;
}

.user-id {
	font-size: 24rpx;
	opacity: 0.8;
}

.points-info {
	background-color: rgba(255, 255, 255, 0.1);
	padding: 20rpx;
	border-radius: 12rpx;
}

.points-label {
	font-size: 24rpx;
	opacity: 0.8;
	margin-bottom: 10rpx;
	display: block;
}

.points-value {
	font-size: 48rpx;
	font-weight: bold;
}

.function-list {
	margin: 20rpx;
	background-color: white;
	border-radius: 12rpx;
	overflow: hidden;
}

.function-item {
	display: flex;
	align-items: center;
	padding: 30rpx;
	border-bottom: 1rpx solid #f0f0f0;
}

.function-item:last-child {
	border-bottom: none;
}

.icon {
	font-size: 40rpx;
	margin-right: 20rpx;
}

.label {
	flex: 1;
	font-size: 28rpx;
}

.arrow {
	color: #999;
	font-size: 28rpx;
}
</style>