<template>
	<view class="page-container" :class="{ 'dark-mode': isDarkMode }">
		<view class="nav-bar">
			<view class="nav-left" @tap="goBack">
				<text class="icon">←</text>
			</view>
			<view class="nav-title">我的收藏</view>
			<view class="nav-right" v-if="favorites.length > 0" @tap="clearAll">
				<text class="clear-btn">清空</text>
			</view>
		</view>

		<view class="favorites-list" v-if="favorites.length > 0">
			<view class="favorite-item" v-for="item in favorites" :key="item.id">
				<view class="item-left">
					<image v-if="item.image" :src="item.image" class="item-image" mode="aspectFill"></image>
					<view v-else class="item-icon">{{ item.icon || '🎁' }}</view>
				</view>
				<view class="item-info">
					<view class="item-name">{{ item.name }}</view>
					<view class="item-desc">{{ item.description || '暂无描述' }}</view>
					<view class="item-points">
						<text class="points-icon">🔥</text>
						<text class="points-value">{{ item.points || 0 }}积分</text>
					</view>
				</view>
				<view class="item-actions">
					<button class="exchange-btn" @tap="exchangeItem(item)">兑换</button>
					<view class="remove-btn" @tap="removeItem(item.id)">取消收藏</view>
				</view>
			</view>
		</view>

		<view class="empty-state" v-else>
			<text class="empty-icon">🤍</text>
			<text class="empty-text">暂无收藏商品</text>
			<text class="empty-hint">去商城看看吧~</text>
			<button class="go-shop-btn" @tap="goToShop">前往商城</button>
		</view>
	</view>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useFavoritesStore } from '@/stores/favoritesStore'
import { useShopStore } from '@/stores/shopStore'
import { usePointsStore } from '@/stores/pointsStore'

export default {
	setup() {
		const favoritesStore = useFavoritesStore()
		const shopStore = useShopStore()
		const pointsStore = usePointsStore()
		const isDarkMode = ref(false)

		const favorites = ref([])

		const loadFavorites = () => {
			favoritesStore.init()
			if (!shopStore.isLoaded) {
				shopStore.loadProducts()
			}
			const favoriteIds = favoritesStore.sortedFavoriteIds
			favorites.value = shopStore.products.filter(p => favoriteIds.includes(p.id))
		}

		const removeItem = (productId) => {
			favoritesStore.removeFavorite(productId)
			uni.showToast({ title: '已取消收藏', icon: 'none' })
			loadFavorites()
		}

		const clearAll = () => {
			uni.showModal({
				title: '提示',
				content: '确定清空所有收藏吗？',
				success: (res) => {
					if (res.confirm) {
						favoritesStore.clearAll()
						loadFavorites()
						uni.showToast({ title: '已清空', icon: 'none' })
					}
				}
			})
		}

		const exchangeItem = (item) => {
			const totalScore = pointsStore.totalScore || 0
			if (item.points > totalScore) {
				uni.showToast({ title: '积分不足', icon: 'none' })
				return
			}
			uni.showModal({
				title: '确认兑换',
				content: `确定兑换「${item.name}」吗？`,
				success: (res) => {
					if (res.confirm) {
						pointsStore.addPoints(-item.points, '商城兑换')
						uni.showToast({ title: '兑换成功！', icon: 'success' })
						removeItem(item.id)
					}
				}
			})
		}

		const goBack = () => uni.navigateBack()
		const goToShop = () => uni.switchTab({ url: '/pages/shop/shop' })

		onMounted(() => {
			loadFavorites()
		})

		return {
			isDarkMode,
			favorites,
			removeItem,
			clearAll,
			exchangeItem,
			goBack,
			goToShop
		}
	}
}
</script>

<style scoped>
.page-container {
	min-height: 100vh;
	background: #f5f5f5;
}

.dark-mode {
	background: #1a1a1a;
}

.nav-bar {
	display: flex;
	align-items: center;
	justify-content: space-between;
	height: 88rpx;
	padding: 0 30rpx;
	background: #fff;
	border-bottom: 1rpx solid #eee;
}

.dark-mode .nav-bar {
	background: #252525;
	border-color: #333;
}

.nav-left, .nav-right {
	width: 100rpx;
}

.nav-title {
	flex: 1;
	text-align: center;
	font-size: 32rpx;
	font-weight: bold;
}

.clear-btn {
	color: #8477fa;
	font-size: 28rpx;
}

.icon {
	font-size: 40rpx;
}

.favorites-list {
	padding: 20rpx;
}

.favorite-item {
	display: flex;
	background: #fff;
	border-radius: 16rpx;
	padding: 20rpx;
	margin-bottom: 20rpx;
	box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.dark-mode .favorite-item {
	background: #252525;
}

.item-left {
	flex-shrink: 0;
}

.item-image {
	width: 140rpx;
	height: 140rpx;
	border-radius: 12rpx;
}

.item-icon {
	width: 140rpx;
	height: 140rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 60rpx;
	background: #f5f5f5;
	border-radius: 12rpx;
}

.dark-mode .item-icon {
	background: #333;
}

.item-info {
	flex: 1;
	margin-left: 20rpx;
	display: flex;
	flex-direction: column;
	justify-content: center;
}

.item-name {
	font-size: 28rpx;
	font-weight: bold;
	color: #333;
	margin-bottom: 8rpx;
}

.dark-mode .item-name {
	color: #fff;
}

.item-desc {
	font-size: 24rpx;
	color: #999;
	margin-bottom: 8rpx;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.item-points {
	display: flex;
	align-items: center;
}

.points-icon {
	font-size: 24rpx;
}

.points-value {
	font-size: 26rpx;
	color: #ff6b6b;
	font-weight: bold;
}

.item-actions {
	display: flex;
	flex-direction: column;
	align-items: flex-end;
	justify-content: center;
}

.exchange-btn {
	width: 140rpx;
	height: 60rpx;
	line-height: 60rpx;
	background: linear-gradient(135deg, #8477fa, #9b95ff);
	color: #fff;
	font-size: 24rpx;
	border: none;
	border-radius: 30rpx;
}

.remove-btn {
	font-size: 22rpx;
	color: #999;
	margin-top: 10rpx;
}

.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 200rpx 0;
}

.empty-icon {
	font-size: 120rpx;
	margin-bottom: 30rpx;
}

.empty-text {
	font-size: 32rpx;
	color: #666;
	margin-bottom: 16rpx;
}

.empty-hint {
	font-size: 26rpx;
	color: #999;
	margin-bottom: 40rpx;
}

.go-shop-btn {
	width: 240rpx;
	height: 80rpx;
	line-height: 80rpx;
	background: linear-gradient(135deg, #8477fa, #9b95ff);
	color: #fff;
	font-size: 28rpx;
	border: none;
	border-radius: 40rpx;
}
</style>
