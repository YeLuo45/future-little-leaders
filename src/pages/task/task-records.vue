<template>
	<view class="page-container" :class="{'dark-mode': isDarkMode}">
		<!-- 顶部导航栏 -->
		<view class="nav-bar">
			<view class="nav-left" @tap="goBack">
				<text class="icon">←</text>
			</view>
			<view class="nav-title">任务记录</view>
		</view>

		<!-- 宝宝选择器 -->
		<view class="baby-selector" v-if="babies.length > 0">
			<picker :range="babies" range-key="name" @change="onBabyChange">
				<view class="baby-select-view">
					<text class="baby-select-text">当前宝宝：</text>
					<text class="baby-name">{{ currentBabyName }}</text>
					<text class="baby-arrow">▼</text>
				</view>
			</picker>
		</view>

		<!-- 任务记录列表 -->
		<view class="records-list">
			<view v-if="taskRecords.length === 0" class="empty-state">
				<text class="empty-text">暂无任务记录</text>
			</view>
			<view v-else class="record-item" v-for="(record, index) in taskRecords" :key="index">
				<view class="record-header">
					<text class="record-title">{{ record.title }}</text>
					<text class="record-status">{{ record.status }}</text>
				</view>
				<view class="record-details">
					<text class="record-description">{{ record.description || '暂无描述' }}</text>
					<text class="record-date">{{ formatDate(record.date) }}</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { isDarkTheme } from '@/utils/themeUtils.js';

export default {
	name: 'TaskRecords',
	setup() {
		const taskRecords = ref([]);
		const isDarkMode = ref(false);
		const authSettings = ref({
			isEnabled: false,
			hasPassword: false,
			hasBiometric: false
		});
		
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
				const storedBabies = uni.getStorageSync('babies') || '[]';
				babies.value = typeof storedBabies === 'string' ? JSON.parse(storedBabies) : (Array.isArray(storedBabies) ? storedBabies : []);
				
				const storedBabyId = uni.getStorageSync('currentBabyId');
				currentBabyId.value = storedBabyId || (babies.value.length > 0 ? babies.value[0].id : '');
				
				if (babies.value.length > 0 && !storedBabyId) {
					uni.setStorageSync('currentBabyId', currentBabyId.value);
				}
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
				uni.setStorageSync('currentBabyId', currentBabyId.value);
				loadTaskRecords();
			}
		};

		// 加载已完成任务记录
		const loadTaskRecords = () => {
			try {
				const records = uni.getStorageSync('completedTaskList') || '[]';
				taskRecords.value = JSON.parse(records)
					.filter(task => (!task.babyId || task.babyId === currentBabyId.value))
					.map(task => ({
						title: task.title,
						description: task.description,
						action: '完成任务',
						date: task.completedAt || new Date().toISOString(),
						status: '已完成'
					}))
					.sort((a, b) => new Date(b.date) - new Date(a.date));
			} catch (e) {
				console.error('加载任务记录失败', e);
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

		// 验证身份
		const verifyIdentity = () => {
			return new Promise((resolve, reject) => {
				if (!authSettings.value.isEnabled) {
					resolve(true);
					return;
				}

				// 如果开启了生物识别
				if (authSettings.value.hasBiometric) {
					uni.startSoterAuthentication({
						requestAuthModes: ['fingerPrint'],
						challenge: 'challenge',
						authContent: '请验证指纹',
						success: () => {
							resolve(true);
						},
						fail: () => {
							// 如果生物识别失败，尝试密码验证
							if (authSettings.value.hasPassword) {
								uni.showModal({
									title: '验证失败',
									content: '是否使用密码验证？',
									success: (res) => {
										if (res.confirm) {
											uni.showModal({
												title: '密码验证',
												editable: true,
												placeholderText: '请输入密码',
												success: (res) => {
													const password = uni.getStorageSync('authPassword');
													if (res.content === password) {
														resolve(true);
													} else {
														uni.showToast({
															title: '密码错误',
															icon: 'none'
														});
														reject(new Error('密码错误'));
													}
												}
											});
										} else {
											reject(new Error('验证取消'));
										}
									}
								});
							} else {
								reject(new Error('验证失败'));
							}
						}
					});
				} else if (authSettings.value.hasPassword) {
					// 如果只开启了密码验证
					uni.showModal({
						title: '密码验证',
						editable: true,
						placeholderText: '请输入密码',
						success: (res) => {
							const password = uni.getStorageSync('authPassword');
							if (res.content === password) {
								resolve(true);
							} else {
								uni.showToast({
									title: '密码错误',
									icon: 'none'
								});
								reject(new Error('密码错误'));
							}
						}
					});
				} else {
					reject(new Error('未设置验证方式'));
				}
			});
		};

		// 完成任务
		const completeTask = async (task) => {
			try {
				await verifyIdentity();
				// 验证通过，执行完成任务逻辑
				// ... 原有的完成任务逻辑 ...
			} catch (error) {
				console.error('验证失败:', error);
				uni.showToast({
					title: '验证失败，无法完成任务',
					icon: 'none'
				});
			}
		};

		onMounted(() => {
			loadBabies();
			loadTaskRecords();
			isDarkMode.value = isDarkTheme();
			loadAuthSettings();

			// 添加宝宝列表更新事件监听
			uni.$on('refreshBabyList', () => {
				loadBabies();
				loadTaskRecords();
			});
			
			// 添加宝宝切换事件监听
			uni.$on('babyChanged', (babyId) => {
				currentBabyId.value = babyId;
				loadTaskRecords();
			});
		});

		onUnmounted(() => {
			uni.$off('refreshBabyList');
			uni.$off('babyChanged');
		});

		return {
			taskRecords,
			isDarkMode,
			formatDate,
			goBack,
			babies,
			currentBabyName,
			onBabyChange,
			completeTask
		};
	}
};
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
	padding: 0 30rpx;
	position: relative;
}

.nav-left {
	position: absolute;
	left: 30rpx;
	z-index: 1;
}

.nav-title {
	flex: 1;
	text-align: center;
	color: white;
	font-size: 32rpx;
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

.record-status {
	font-size: 24rpx;
	color: #8477fa;
}

.record-details {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.record-description {
	font-size: 26rpx;
	color: #666;
	display: -webkit-box;
	-webkit-box-orient: vertical;
	-webkit-line-clamp: 2;
	overflow: hidden;
	text-overflow: ellipsis;
	margin-bottom: 10rpx;
	width: 70%;
}

.record-date {
	font-size: 24rpx;
	color: #999;
}

.dark-mode .record-date {
	color: #777;
}

/* 添加宝宝选择器样式 */
.baby-selector {
	margin: 20rpx;
	padding: 20rpx;
	background-color: white;
	border-radius: 12rpx;
	box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
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
	color: #333;
	margin: 0 10rpx;
}

.dark-mode .baby-name {
	color: #fff;
}

.baby-arrow {
	font-size: 24rpx;
	color: #999;
}
</style> 