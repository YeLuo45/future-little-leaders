<template>
	<view class="page-container" :class="{'dark-mode': isDarkMode}">
		<!-- 顶部导航栏 -->
		<view class="nav-bar">
			<view class="nav-left" @tap="goBack">
				<text class="icon">←</text>
			</view>
			<view class="nav-title">任务记录</view>
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
					<text class="record-action">{{ record.action }}</text>
					<text class="record-date">{{ formatDate(record.date) }}</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import { ref, onMounted } from 'vue';
import { isDarkTheme } from '@/utils/themeUtils.js';

export default {
	name: 'TaskRecords',
	setup() {
		const taskRecords = ref([]);
		const isDarkMode = ref(false);

		// 加载任务记录
		const loadTaskRecords = () => {
			try {
				const records = uni.getStorageSync('taskList') || '[]';
				taskRecords.value = JSON.parse(records)
					.filter(task => task.status === 'completed')
					.map(task => ({
						title: task.title,
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

		onMounted(() => {
			loadTaskRecords();
			isDarkMode.value = isDarkTheme();
		});

		return {
			taskRecords,
			isDarkMode,
			formatDate,
			goBack
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
	background-color: #8477fa;
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

.record-action {
	font-size: 26rpx;
	color: #666;
}

.dark-mode .record-action {
	color: #aaa;
}

.record-date {
	font-size: 24rpx;
	color: #999;
}

.dark-mode .record-date {
	color: #777;
}
</style> 