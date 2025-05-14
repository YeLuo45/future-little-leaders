<template>
	<view class="page-container" :class="{'dark-mode': isDarkMode}">
		<!-- 用户信息区域 -->
		<view class="user-info">
			<view class="avatar-section">
				<image class="avatar" :src="userInfo.avatar || '/static/avatar.svg'" mode="aspectFill" @tap="navigateToEditProfile"></image>
				<view class="user-details">
					<text class="nickname">{{ userInfo.nickname || '未设置昵称' }}</text>
					<!-- <text class="user-id">ID: {{ userInfo.id || '未设置ID' }}</text> -->
				</view>
			</view>
			<view class="points-info">
				<text class="points-label">当前积分</text>
				<text class="points-value">{{ totalScore }}</text>
			</view>
		</view>

		<!-- 宝宝选择器区域 -->
		<view class="baby-selector">
			<picker :range="babies" range-key="name" @change="onBabyChange">
				<view class="baby-select-view">
					<text>当前宝宝：</text>
					<text class="baby-name">{{ currentBabyName }}</text>
					<text class="baby-arrow">▼</text>
				</view>
			</picker>
			<button class="add-baby-btn" @tap="navigateToAddBaby">添加宝宝</button>
		</view>

		<!-- 功能列表 -->
		<view class="function-list">
			<view class="function-item" @tap="navigateTo('task/task-records')">
				<text class="icon">📋</text>
				<text class="label">任务记录</text>
				<text class="arrow">></text>
			</view>
			<view class="function-item" @tap="navigateTo('task/recurring-tasks')">
				<text class="icon">🔄</text>
				<text class="label">任务管理</text>
				<text class="arrow">></text>
			</view>
			<view class="function-item" @tap="navigateTo('shop/exchange-records')">
				<text class="icon">🛍️</text>
				<text class="label">兑换记录</text>
				<text class="arrow">></text>
			</view>
			<view class="function-item" @tap="navigateTo('profile/baby-management')">
				<text class="icon">👶</text>
				<text class="label">宝宝管理</text>
				<text class="arrow">></text>
			</view>
			<!-- <view class="function-item" @tap="navigateTo('favorites')">
				<text class="icon">⭐</text>
				<text class="label">我的收藏</text>
				<text class="arrow">></text>
			</view> -->
			<view class="function-item" @tap="navigateTo('settings/auth-settings')">
				<text class="icon">🔒</text>
				<text class="label">认证模式</text>
				<text class="arrow">></text>
			</view>
			<view class="function-item" @tap="navigateTo('settings/settings')">
				<text class="icon">⚙️</text>
				<text class="label">设置</text>
				<text class="arrow">></text>
			</view>
			
		</view>
	</view>
</template>

<script>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { isDarkTheme } from '@/utils/themeUtils.js';
import { useThemeStore } from '@/stores/theme';
import { getBabyPoints } from '@/utils/pointsManager';

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
		const authSettings = ref({
			isEnabled: false,
			hasPassword: false,
			hasBiometric: false
		});

		// 宝宝相关
		const babies = ref([]);
		const currentBabyId = ref('');
		const currentBabyName = computed(() => {
			// 首先确保babies.value是数组，并且有元素
			if (!Array.isArray(babies.value) || babies.value.length === 0) {
				return '暂无宝宝';
			}
			// 查找当前宝宝
			const baby = babies.value.find(b => b && b.id === currentBabyId.value);
			return baby ? baby.name : '请选择宝宝';
		});

		// 跳转到添加宝宝页面
		const navigateToAddBaby = () => {
			uni.navigateTo({
				url: '/pages/profile/add-baby'
			});
		};

		// 跳转到个人信息编辑页面
		const navigateToEditProfile = () => {
			uni.navigateTo({
				url: '/pages/profile/profile-edit'
			});
		};

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
		const updatePoints = (babyId) => {
			const id = babyId || currentBabyId.value;
			if (id) {
				totalScore.value = getBabyPoints(id);
			} else {
				totalScore.value = getBabyPoints();
			}
		};

		// 加载任务记录
		const loadTaskRecords = () => {
			try {
				const records = uni.getStorageSync('taskList') || '[]';
				taskRecords.value = JSON.parse(records)
					.filter(task => task.status === 'completed' && (!task.babyId || task.babyId === currentBabyId.value))
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
					.filter(record => !record.babyId || record.babyId === currentBabyId.value)
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

		// 加载认证设置
		const loadAuthSettings = () => {
			try {
				const settings = uni.getStorageSync('authSettings');
				if (settings) {
					authSettings.value = JSON.parse(settings);
				}
			} catch (e) {
				console.error('加载认证设置失败:', e);
			}
		};

		// 加载宝宝信息
		const loadBabies = () => {
			try {
				// 确保babies总是一个数组
				const storedBabies = uni.getStorageSync('babies') || '[]';
				babies.value = typeof storedBabies === 'string' ? JSON.parse(storedBabies) : (Array.isArray(storedBabies) ? storedBabies : []);
				
				console.log('宝宝列表类型:', typeof babies.value, '是否数组:', Array.isArray(babies.value), '数量:', babies.value.length);
				
				const storedBabyId = uni.getStorageSync('currentBabyId');
				currentBabyId.value = storedBabyId || (babies.value.length > 0 ? babies.value[0].id : '');
				
				// 如果存在宝宝且未设置当前宝宝ID，设置第一个宝宝为当前宝宝
				if (babies.value.length > 0 && !storedBabyId) {
					uni.setStorageSync('currentBabyId', currentBabyId.value);
				}
				
				// 更新当前宝宝积分
				updatePoints(currentBabyId.value);
			} catch (e) {
				console.error('加载宝宝信息失败:', e);
				// 发生错误时确保babies是一个空数组
				babies.value = [];
			}
		};

		// 切换宝宝
		const onBabyChange = (e) => {
			const idx = e.detail.value;
			// 确保索引有效
			if (idx >= 0 && idx < babies.value.length && babies.value[idx]) {
				currentBabyId.value = babies.value[idx].id;
				uni.setStorageSync('currentBabyId', currentBabyId.value);
				
				// 更新积分显示
				updatePoints(currentBabyId.value);
				
				// 广播宝宝切换事件
				uni.$emit('babyChanged', currentBabyId.value);
				
				// 重新加载任务和兑换记录
				loadTaskRecords();
				loadExchangeRecords();
			} else {
				console.error('宝宝切换失败: 无效的索引', idx, '宝宝列表长度:', babies.value.length);
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
			loadBabies();
			loadTaskRecords();
			loadExchangeRecords();
			loadAuthSettings();
			isDark.value = isDarkTheme();

			// 初始化主题
			if (themeStore.initTheme) {
				themeStore.initTheme();
			}

			// 添加积分更新事件监听
			uni.$on('pointsUpdated', updatePoints);
			
			// 添加宝宝积分更新事件监听
			uni.$on('babyPointsUpdated', (data) => {
				if (data && data.babyId === currentBabyId.value) {
					totalScore.value = data.points;
				}
			});
			
			// 添加宝宝列表更新事件监听
			uni.$on('refreshBabyList', () => {
				loadBabies();
				loadTaskRecords();
				loadExchangeRecords();
			});

			// 添加 refreshUserInfo 事件监听，编辑页保存后刷新主页面
			uni.$on('refreshUserInfo', loadUserInfo);
		});

		onUnmounted(() => {
			// 移除事件监听
			uni.$off('pointsUpdated');
			uni.$off('babyPointsUpdated');
			uni.$off('refreshBabyList');
			uni.$off('refreshUserInfo');
		});

		return {
			userInfo,
			totalScore,
			isDark,
			navigateTo,
			taskRecords,
			exchangeRecords,
			babies,
			currentBabyId,
			currentBabyName,
			onBabyChange,
			navigateToAddBaby,
			authSettings,
			navigateToEditProfile
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

.baby-selector {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 20rpx 30rpx;
	background: #fff;
	border-radius: 16rpx;
	margin: 20rpx 30rpx 0 30rpx;
	box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.06);
}
.baby-select-view {
	display: flex;
	align-items: center;
	padding-left: 60rpx;
}
.baby-name {
	font-weight: bold;
	color: #7C3AED;
	margin: 0 10rpx;
}
.baby-arrow {
	font-size: 24rpx;
	color: #888;
}
.add-baby-btn {
	background: linear-gradient(135deg, #8B5CF6, #7C3AED);
	color: #fff;
	border: none;
	border-radius: 20rpx;
	padding: 10rpx 30rpx;
	font-size: 28rpx;
	box-shadow: 0 2rpx 8rpx rgba(124, 58, 237, 0.15);
}
</style>