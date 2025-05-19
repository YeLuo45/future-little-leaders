<template>
	<view class="page-container" :class="{ 'dark-mode': isDarkMode }">
		<!-- 顶部导航栏 -->
		<view class="nav-bar">
			<view class="nav-left" @tap="goBack">
				<text class="icon">←</text>
			</view>
			<view class="nav-title">积分记录</view>
		</view>

		<!-- 宝宝选择器 -->
		<view class="baby-selector" v-if="babies.length > 0">
			<!-- <picker :range="babies" range-key="name" @change="onBabyChange"> -->
			<picker :range="babies" range-key="name">
				<view class="baby-select-view">
					<text class="baby-select-text">当前宝宝：</text>
					<text class="baby-name">{{ currentBabyName }}</text>
					<!-- <text class="baby-arrow">▼</text> -->
				</view>
			</picker>
		</view>

		<!-- 积分记录列表 -->
		<view class="records-list">
			<view v-if="pointsRecords.length === 0" class="empty-state">
				<text class="empty-text">暂无积分记录</text>
			</view>
			<view v-else class="record-item" v-for="(record, index) in pointsRecords" :key="index">
				<view class="record-header">
					<text class="record-title">{{ record.description }}</text>
					<text class="record-points"
						:class="{ 'income': record.type === 'income', 'expense': record.type === 'expense' }">
						{{ record.type === 'income' ? '+' : '-' }}{{ record.points }}
					</text>
				</view>
				<view class="record-details">
					<text class="record-type">{{ record.type === 'income' ? '收入' : '支出' }}</text>
					<text class="record-date">{{ formatDate(record.createdAt) }}</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
	import { ref, onMounted, onUnmounted, computed } from 'vue';
	import { isDarkTheme } from '@/utils/themeUtils.js';
	import { usePointsStore } from '@/stores/pointsStore';
	import { useBabyStore } from '@/stores/babyStore';

	// 状态
	const pointsRecords = ref([]);
	const isDarkMode = ref(false);

	// Store实例
	const pointsStore = usePointsStore();
	const babyStore = useBabyStore();

	// 宝宝相关
	const babies = ref([]);
	const currentBabyId = ref('');
	const currentBabyName = computed(() => {
		if (!Array.isArray(babies.value) || babies.value.length === 0) {
			return '暂无宝宝';
		}
		const baby = babies.value.find(b => b && b.id === currentBabyId.value);
		return baby ? baby.name : '请选择宝宝';
	});

	// 加载宝宝信息
	const loadBabies = () => {
		try {
			// 优先使用babyStore
			if (babyStore.babies && babyStore.babies.length > 0) {
				babies.value = babyStore.babies;
				currentBabyId.value = babyStore.currentBabyId;
			} else {
				// 兼容直接从存储加载
				const storedBabies = uni.getStorageSync('babies') || '[]';
				babies.value = typeof storedBabies === 'string' ? JSON.parse(storedBabies) : (Array.isArray(storedBabies) ? storedBabies : []);

				const storedBabyId = uni.getStorageSync('currentBabyId');
				currentBabyId.value = storedBabyId || (babies.value.length > 0 ? babies.value[0].id : '');
			}

			// 加载当前宝宝的积分记录
			loadPointsRecords();
		} catch (e) {
			console.error('加载宝宝信息失败:', e);
			babies.value = [];
		}
	};

	// 切换宝宝
	const onBabyChange = (e) => {
		const idx = e.detail.value;
		if (idx >= 0 && idx < babies.value.length && babies.value[idx]) {
			currentBabyId.value = babies.value[idx].id;

			// 如果使用babyStore，更新currentBabyId
			if (babyStore.setCurrentBabyId) {
				babyStore.setCurrentBabyId(currentBabyId.value);
			} else {
				uni.setStorageSync('currentBabyId', currentBabyId.value);
			}

			loadPointsRecords();

			// 广播宝宝切换事件
			uni.$emit('babyChanged', {
				babyId: currentBabyId.value,
				babyInfo: babies.value[idx],
				source: 'points-records',
				timestamp: Date.now()
			});
		}
	};

	// 加载积分记录
	const loadPointsRecords = () => {
		try {
			// 使用pointsStore加载积分记录
			if (pointsStore.loadPointsRecords) {
				pointsStore.loadPointsRecords();
			}

			// 获取当前宝宝的积分记录
			const babyId = currentBabyId.value;

			// 使用pinia store或者直接从存储中读取
			if (pointsStore.pointsRecords) {
				pointsRecords.value = pointsStore.pointsRecords
					.filter(record => record.babyId === babyId)
					.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
			} else {
				// 兼容直接从存储读取
				const storedRecords = uni.getStorageSync('pointsRecords') || '[]';
				const records = JSON.parse(storedRecords);
				pointsRecords.value = records
					.filter(record => record.babyId === babyId)
					.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
			}
		} catch (e) {
			console.error('加载积分记录失败:', e);
			pointsRecords.value = [];
		}
	};

	// 格式化日期
	const formatDate = (dateString) => {
		const date = new Date(dateString);
		return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
	};

	// 返回上一页
	const goBack = () => {
		uni.navigateBack();
	};

	onMounted(() => {
		// 初始化Store
		if (pointsStore.init) {
			pointsStore.init();
		}
		if (babyStore.init) {
			babyStore.init();
		}

		// 加载数据
		loadBabies();
		isDarkMode.value = isDarkTheme();

		// 添加事件监听
		uni.$on('refreshBabyList', () => {
			loadBabies();
		});

		uni.$on('babyChanged', (data) => {
			// 检查是否为对象(新格式)或字符串(旧格式)
			const babyId = typeof data === 'object' ? data.babyId : data;
			const source = typeof data === 'object' ? (data.source || 'unknown') : 'unknown';

			// 避免自己触发的事件导致循环
			if (source === 'points-records') {
				return;
			}

			// 只有当ID变化时才更新
			if (currentBabyId.value !== babyId) {
				currentBabyId.value = babyId;
				loadPointsRecords();
			}
		});

		// 添加积分更新事件
		uni.$on('pointsUpdated', () => {
			loadPointsRecords();
		});
	});

	onUnmounted(() => {
		// 移除事件监听
		uni.$off('refreshBabyList');
		uni.$off('babyChanged');
		uni.$off('pointsUpdated');
	});
</script>

<style>
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

	.records-list {
		padding: 20rpx;
	}

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

	.dark-mode .empty-text {
		color: #666;
	}

	.record-item {
		background-color: white;
		border-radius: 12rpx;
		padding: 20rpx;
		margin-bottom: 20rpx;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
	}

	.dark-mode .record-item {
		background-color: #2a2a2a;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.2);
	}

	.record-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 10rpx;
	}

	.record-title {
		font-size: 30rpx;
		font-weight: bold;
	}

	.record-points {
		font-size: 32rpx;
		font-weight: bold;
	}

	.income {
		color: #4caf50;
	}

	.expense {
		color: #f44336;
	}

	.record-details {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.record-type {
		font-size: 26rpx;
		color: #666;
		padding: 4rpx 10rpx;
		background-color: #f5f5f5;
		border-radius: 4rpx;
	}

	.dark-mode .record-type {
		background-color: #333;
		color: #aaa;
	}

	.record-date {
		font-size: 24rpx;
		color: #999;
	}

	.dark-mode .record-date {
		color: #777;
	}

	/* 宝宝选择器样式 */
	.baby-selector {
		margin: 20rpx;
		padding: 20rpx;
		background-color: white;
		border-radius: 12rpx;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
		display: flex;
		justify-content: center;
	}

	.dark-mode .baby-selector {
		background-color: #2a2a2a;
	}

	.baby-select-view {
		display: flex;
		align-items: center;
	}

	.baby-select-text {
		font-size: 28rpx;
		color: #666;
	}

	.dark-mode .baby-select-text {
		color: #999;
	}

	.baby-name {
		flex: 1;
		font-size: 28rpx;
		font-weight: bold;
		color: #7C3AED;
		margin: 0 10rpx;
	}

	.dark-mode .baby-name {
		color: #a78bfa;
	}

	.baby-arrow {
		font-size: 24rpx;
		color: #999;
	}
</style>