<template>
	<view class="page-container" :class="{'dark-mode': isDarkMode}">
		<!-- 顶部导航栏 -->
		<view class="nav-bar">
			<view class="nav-left" @tap="goBack">
				<text class="icon">←</text>
			</view>
			<view class="nav-title">我的收藏</view>
		</view>

		<!-- 收藏列表 -->
		<view class="favorites-list">
			<view v-if="favorites.length === 0" class="empty-state">
				<text class="empty-text">暂无收藏内容</text>
			</view>
			<view v-else class="favorite-item" v-for="(item, index) in favorites" :key="index">
				<view class="favorite-content">
					<text class="favorite-title">{{ item.title }}</text>
					<text class="favorite-desc">{{ item.description }}</text>
				</view>
				<view class="favorite-actions">
					<button class="action-btn" @tap="removeFavorite(index)">取消收藏</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import { ref, onMounted } from 'vue';
import { isDarkTheme } from '@/utils/themeUtils.js';

export default {
	name: 'Favorites',
	setup() {
		const favorites = ref([]);
		const isDarkMode = ref(false);

		// 加载收藏列表
		const loadFavorites = () => {
			try {
				const storedFavorites = uni.getStorageSync('favorites') || '[]';
				favorites.value = JSON.parse(storedFavorites);
			} catch (e) {
				console.error('加载收藏失败', e);
			}
		};

		// 取消收藏
		const removeFavorite = (index) => {
			uni.showModal({
				title: '提示',
				content: '确定要取消收藏吗？',
				success: (res) => {
					if (res.confirm) {
						favorites.value.splice(index, 1);
						uni.setStorageSync('favorites', JSON.stringify(favorites.value));
						uni.showToast({
							title: '已取消收藏',
							icon: 'success'
						});
					}
				}
			});
		};

		// 返回上一页
		const goBack = () => {
			uni.navigateBack();
		};

		onMounted(() => {
			loadFavorites();
			isDarkMode.value = isDarkTheme();
		});

		return {
			favorites,
			isDarkMode,
			removeFavorite,
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

.favorites-list {
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

.favorite-item {
	background-color: white;
	border-radius: 12rpx;
	padding: 20rpx;
	margin-bottom: 20rpx;
	box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.dark-mode .favorite-item {
	background-color: #2a2a2a;
	box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.2);
}

.favorite-content {
	margin-bottom: 20rpx;
}

.favorite-title {
	font-size: 30rpx;
	font-weight: bold;
	margin-bottom: 10rpx;
	display: block;
}

.favorite-desc {
	font-size: 26rpx;
	color: #666;
}

.dark-mode .favorite-desc {
	color: #aaa;
}

.favorite-actions {
	display: flex;
	justify-content: flex-end;
}

.action-btn {
	background-color: #f5f5f5;
	color: #666;
	font-size: 24rpx;
	padding: 10rpx 20rpx;
	border-radius: 30rpx;
	border: none;
}

.dark-mode .action-btn {
	background-color: #3a3a3a;
	color: #aaa;
}
</style> 