<template>
	<view class="page-container" :class="{ 'dark-mode': isDarkMode }">
		<view class="page-header">
			<view class="header-content">
				<view class="title-section">
					<text class="title">积分商城</text>
					<text class="subtitle">用积分兑换心仪礼品</text>
				</view>
				<view class="points">{{ totalScore }}积分</view>
			</view>
		</view>

		<view class="search-box" :class="{ 'dark-mode': isDarkMode }">
			<text class="search-icon">🔍</text>
			<input type="text" v-model="searchKeyword" placeholder="搜索商品" class="search-input" confirm-type="search"
				@confirm="searchProducts" />
			<text class="search-clear" v-if="searchKeyword" @tap="clearSearch">✕</text>
		</view>

		<scroll-view scroll-y class="products-list">
			<view class="product-list">
				<view class="product-card" v-for="(item, index) in (products || [])" :key="index" @tap="goToProductDetail(item, index)">
					<view class="product-content">
						<view class="product-left">
							<view class="product-icon">{{ item.icon || '🎁' }}</view>
						</view>
						<view class="product-info">
							<view class="product-title">
								<view class="product-name">{{ item.name }}</view>
							</view>
							<view class="product-tags">
								<view class="product-points">
									<text class="points-icon">🔥</text>
									<text class="points-value">{{ item.points || 0 }}积分</text>
								</view>
								<view class="product-stock">
									<text class="stock-icon">📦</text>
									<text class="stock-value">{{ item.stock || '无限' }}</text>
								</view>
							</view>
							<view class="product-description">{{ item.description || '暂无描述' }}</view>
						</view>
					</view>
					<view class="product-action" :class="{ 'dark-mode': isDarkMode }">
						<button class="exchange-btn" @tap.stop="exchangeProduct(item)">兑换</button>
					</view>
				</view>

				<!-- 无商品提示 -->
				<view class="empty-state" v-if="!products || products.length === 0">
					<text class="empty-text">暂无商品</text>
				</view>
			</view>
		</scroll-view>

		<!-- 悬浮添加按钮 -->
		<view class="float-btn" :class="{ 'dark-mode': isDarkMode }" @tap="goToAddProduct">
			<text>＋</text>
		</view>
	</view>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';
import { useThemeStore } from '@/stores/theme';
import { getTotalPoints, deductPoints, updateTotalPoints } from '@/utils/pointsManager';
import { isDarkTheme } from '@/utils/themeUtils.js';

export default {
	setup() {
		const themeStore = useThemeStore();
		const isDarkMode = ref(false);
		const totalScore = ref(0);
		const products = ref([]);
		const searchKeyword = ref('');

		// 清除搜索内容
		const clearSearch = () => {
			searchKeyword.value = '';
		};

		// 搜索商品
		const searchProducts = () => {
			// 这里可以添加更多搜索逻辑
			uni.showToast({
				title: '搜索: ' + searchKeyword.value,
				icon: 'none',
				duration: 1000
			});
		};

		// 跳转到添加商品页面
		const goToAddProduct = () => {
			uni.navigateTo({
				url: '/pages/shop/add-product'
			});
		};

		// 跳转到商品详情页
		const goToProductDetail = (item, index) => {
			// 存储当前商品信息，带上index方便详情页库存等操作
			uni.setStorageSync('currentProduct', { ...item, index });
			uni.navigateTo({
				url: '/pages/shop/product-detail'
			});
		};

		// 加载商品列表
		const loadProducts = () => {
			try {
				const storedProducts = uni.getStorageSync('shopProducts');
				if (storedProducts) {
					// 检查存储的数据是否是有效的JSON字符串
					if (typeof storedProducts === 'string') {
						try {
							const parsedProducts = JSON.parse(storedProducts);
							// 验证解析后的数据是否是数组
							if (Array.isArray(parsedProducts)) {
								products.value = parsedProducts;
							} else {
								console.warn('存储的商品数据不是数组，将使用默认商品列表');
								setDefaultProducts();
							}
						} catch (parseError) {
							console.error('解析商品数据失败:', parseError);
							setDefaultProducts();
						}
					} else {
						console.warn('存储的商品数据不是字符串，将使用默认商品列表');
						setDefaultProducts();
					}
				} else {
					setDefaultProducts();
				}
			} catch (e) {
				console.error('加载商品列表失败:', e);
				setDefaultProducts();
			}
		};

		// 设置默认商品列表
		const setDefaultProducts = () => {
			products.value = [
				{
					name: '游戏时间30分钟',
					points: 50,
					stock: '无限',
					icon: '🎮',
					description: '获得额外30分钟游戏时间，可在周末或假期使用。兑换后立即生效。'
				},
				{
					name: '新玩具',
					points: 200,
					stock: 5,
					icon: '🎁',
					description: '可从玩具柜中选择一款喜欢的玩具带回家。限量供应，先到先得。'
				}
			];
			// 保存默认商品列表
			try {
				uni.setStorageSync('shopProducts', JSON.stringify(products.value));
			} catch (e) {
				console.error('保存默认商品列表失败:', e);
			}
		};

		// 兑换商品
		const exchangeProduct = async (product) => {
			if (!product || product.points > totalScore.value) {
				uni.showToast({
					title: '积分不足',
					icon: 'none'
				});
				return;
			}

			try {
				// 扣除积分
				if (await deductPoints(product.points)) {
					// 创建兑换记录
					const exchangeRecord = {
						productName: product.name,
						points: product.points,
						exchangeTime: new Date().toISOString(),
						status: '兑换成功'
					};

					// 保存兑换记录
					const history = JSON.parse(uni.getStorageSync('exchangeHistory') || '[]');
					history.unshift(exchangeRecord);
					uni.setStorageSync('exchangeHistory', JSON.stringify(history));

					// 更新积分显示
					updatePoints();

					uni.showToast({
						title: '兑换成功',
						icon: 'success'
					});
				}
			} catch (e) {
				console.error('兑换失败:', e);
				uni.showToast({
					title: '兑换失败，请重试',
					icon: 'none'
				});
			}
		};

		// 更新积分显示
		const updatePoints = () => {
			totalScore.value = getTotalPoints();
		};

		onMounted(() => {
			// 初始化主题
			if (themeStore.initTheme) {
				themeStore.initTheme();
			}

			// 添加积分更新事件监听
			uni.$on('pointsUpdated', updatePoints);
			// 添加商品列表更新事件监听
			uni.$on('refreshProductList', loadProducts);

			// 初始化积分
			updatePoints();

			// 加载商品列表
			loadProducts();
		});

		onUnmounted(() => {
			// 移除事件监听
			uni.$off('pointsUpdated');
			uni.$off('refreshProductList');
		});

		return {
			isDarkMode,
			totalScore,
			products,
			searchKeyword,
			exchangeProduct,
			updatePoints,
			loadProducts,
			clearSearch,
			searchProducts,
			goToAddProduct,
			goToProductDetail
		};
	}
}
</script>

<style scoped>
.page-container {
	min-height: 100vh;
	padding-bottom: 50px;
	/* 调整底部内边距，为原生tabBar留出空间 */
	background-color: #f8f8f8;
}

.page-container.dark-mode {
	background-color: #121212;
}

/* .page-header {
	padding: 40rpx 30rpx 30rpx;
	background: linear-gradient(135deg, #8B5CF6, #7C3AED);
	color: white;
	position: relative;
	box-shadow: 0 6rpx 16rpx rgba(132, 119, 250, 0.2);
} */

.page-header {
	padding: 40rpx 30rpx 30rpx;
	background: linear-gradient(135deg, #8B5CF6, #7C3AED);
	color: white;
	position: relative;
    border-radius: 0 0 30rpx 30rpx;
    box-shadow: 0 4rpx 20rpx rgba(124, 58, 237, 0.3);
}

.dark-mode .page-header {
	/* background-color: #5e52c9; */
	background: linear-gradient(135deg, #8B5CF6, #7C3AED);
	box-shadow: 0 6rpx 16rpx rgba(94, 82, 201, 0.3);
}

.header-content {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.title-section {
	display: flex;
	flex-direction: column;
}

.title {
  margin-top: 10rpx;
	font-size: 48rpx;
	font-weight: bold;
	margin-bottom: 10rpx;
	text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
}

.subtitle {
  font-size: 28rpx;
  opacity: 0.9;
  margin-bottom: 10rpx;
}

.points {
	background-color: rgba(255, 255, 255, 0.25);
	padding: 12rpx 28rpx;
	border-radius: 40rpx;
	font-size: 34rpx;
	font-weight: bold;
	box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.1);
	text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
}

.search-box {
	margin: 30rpx;
	height: 80rpx;
	background-color: white;
	border-radius: 40rpx;
	display: flex;
	align-items: center;
	padding: 0 30rpx;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.06);
}

.shop-container.dark-mode .search-box {
	background-color: #1f1f1f;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.2);
}

.search-icon {
	margin-right: 20rpx;
	font-size: 32rpx;
	color: #999;
}

.dark-mode .search-icon {
	color: #777;
}

.search-input {
	flex: 1;
	height: 80rpx;
	font-size: 28rpx;
	color: #333;
}

.dark-mode .search-input {
	color: #e0e0e0;
}

.search-clear {
	width: 40rpx;
	height: 40rpx;
	display: flex;
	justify-content: center;
	align-items: center;
	color: #999;
}

.dark-mode .search-clear {
	color: #777;
}

.products-list {
	/* padding: 0 20rpx; */
	padding-top: 20rpx;
	margin-bottom: 140rpx;
	height: calc(100vh - 320rpx);
}

.product-list {
	display: flex;
	flex-wrap: wrap;
	justify-content: space-between;
	padding: 10rpx;
	margin-left: 40rpx;
	margin-right: 40rpx;
}

.product-card {
	background-color: white;
	border-radius: 24rpx;
	margin-bottom: 30rpx;
	box-shadow: 0 6rpx 16rpx rgba(0, 0, 0, 0.06);
	position: relative;
	transition: transform 0.2s, box-shadow 0.2s;
	overflow: hidden;
	width: 48%;
	/* 一行两列，留出间隔 */
	max-width: none;
}

.product-card.dark-mode {
	background-color: #1f1f1f;
	box-shadow: 0 6rpx 16rpx rgba(0, 0, 0, 0.2);
}

.product-card:active {
	transform: scale(0.98);
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.dark-mode .product-card:active {
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.15);
}

.product-content {
	padding: 20rpx;
	display: flex;
	flex-direction: column;
}

.product-left {
	position: relative;
	margin-right: 0;
	margin-bottom: 15rpx;
	align-self: center;
}

.product-icon {
	font-size: 60rpx;
	background-color: #f8f8f8;
	width: 120rpx;
	height: 120rpx;
	border-radius: 20rpx;
	display: flex;
	justify-content: center;
	align-items: center;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}

.product-icon.dark-mode {
	background-color: #2a2a2a;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.3);
}

.product-info {
	flex: 1;
	display: flex;
	flex-direction: column;
	min-height: auto;
	justify-content: space-between;
	margin-left: 0;
}

.product-title {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	width: 100%;
}

.product-name {
	font-size: 28rpx;
	font-weight: bold;
	color: #333;
	margin-bottom: 10rpx;
	line-height: 1.3;
	width: calc(100% - 50rpx);
	/* 文本溢出处理 */
	overflow: hidden;
	text-overflow: ellipsis;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
}

.product-name.dark-mode {
	color: #e0e0e0;
}

.product-tags {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 10rpx;
}

.product-points {
	display: flex;
	align-items: center;
}

.points-icon {
	margin-right: 5rpx;
	font-size: 24rpx;
	color: #8477fa;
}

.points-value {
	font-size: 24rpx;
	font-weight: 500;
	color: #333;
}

.product-stock {
	display: flex;
	align-items: center;
}

.stock-icon {
	margin-right: 5rpx;
	font-size: 24rpx;
	color: #8477fa;
}

.stock-value {
	font-size: 24rpx;
	font-weight: 500;
	color: #333;
}

.product-description {
	font-size: 24rpx;
	color: #666;
	margin-bottom: 10rpx;
}

.product-action {
	display: flex;
	justify-content: center;
	padding: 10rpx 20rpx 16rpx;
	background-color: #f9f9f9;
	border-top: 1rpx solid #f0f0f0;
}

.dark-mode .product-action {
	background-color: #252525;
	border-top: 1rpx solid #333;
}

.exchange-btn {
	width: 100%;
	height: 70rpx;
	line-height: 70rpx;
	text-align: center;
	font-size: 26rpx;
	color: white;
	/* background-color: #8477fa; */
	background: linear-gradient(135deg, #8B5CF6, #7C3AED);
	border-radius: 10rpx;
	border: none;
	box-shadow: 0 6rpx 12rpx rgba(132, 119, 250, 0.2);
	transition: transform 0.15s, box-shadow 0.15s;
}

.exchange-btn:active {
	transform: translateY(2rpx);
	box-shadow: 0 2rpx 6rpx rgba(132, 119, 250, 0.15);
}

/* 对于小屏设备的适配 */
@media screen and (max-width: 375px) {
	.product-card {
		width: 100%;
	}
}

.empty-state {
	display: flex;
	justify-content: center;
	align-items: center;
	padding: 60rpx 0;
	color: #999;
	font-size: 28rpx;
	width: 100%;
	background-color: #f9f9f9;
	border-radius: 16rpx;
	margin-top: 20rpx;
}

.empty-state.dark-mode {
	background-color: #2a2a2a;
	color: #777;
}

.empty-text {
	font-size: 28rpx;
}

/* 移除这些样式，使用全局样式 */
/* .float-btn {
	position: fixed;
	right: 30rpx;
	bottom: 150rpx;
	width: 110rpx;
	height: 110rpx;
	border-radius: 50%;
	background: linear-gradient(135deg, #9f8eff, #8477fa);
	display: flex;
	justify-content: center;
	align-items: center;
	color: white;
	font-size: 60rpx;
	box-shadow: 0 8rpx 25rpx rgba(132, 119, 250, 0.4);
	z-index: 99;
	transform: rotate(0deg);
	transition: all 0.3s;
} */

/* 浮动按钮 */
.float-btn {
	position: fixed;
	right: 40rpx;
	bottom: 180rpx;
	/* 增加底部距离 */
	width: 100rpx;
	height: 100rpx;
	/* background: linear-gradient(135deg, #8477fa, #6b5bff); */
	background: linear-gradient(135deg, #8B5CF6, #7C3AED);
	color: white;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 60rpx;
	box-shadow: 0 4rpx 16rpx rgba(132, 119, 250, 0.3);
	/* 提高z-index确保在最上层 */
	z-index: 100;
	transition: transform 0.2s ease;
}


/* 添加按钮悬停和点击效果 */
.float-btn:active {
	transform: scale(0.95);
}

/* .float-btn:active {
	transform: rotate(90deg) scale(0.95);
	box-shadow: 0 5rpx 15rpx rgba(132, 119, 250, 0.3);
} */

/* 图标选择器样式 */
.icon-picker {
	display: flex;
	flex-wrap: wrap;
	margin-bottom: 30rpx;
}

.icon-option {
	width: 80rpx;
	height: 80rpx;
	display: flex;
	justify-content: center;
	align-items: center;
	border: 1rpx solid #eee;
	border-radius: 16rpx;
	font-size: 40rpx;
	background-color: #f9f9f9;
}

.icon-option.selected {
	border-color: #8477fa;
	background-color: rgba(132, 119, 250, 0.1);
}

.modal-input {
	height: 80rpx;
	background-color: #f5f5f5;
	border-radius: 12rpx;
	margin-bottom: 20rpx;
	padding: 0 20rpx;
	font-size: 28rpx;
	color: #333;
}

.modal-textarea {
	height: 160rpx;
	background-color: #f5f5f5;
	border-radius: 12rpx;
	margin-bottom: 20rpx;
	padding: 20rpx;
	font-size: 28rpx;
	color: #333;
	width: 100%;
	box-sizing: border-box;
}
</style>