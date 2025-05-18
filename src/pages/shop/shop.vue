<template>
	<view class="page-container" :class="{ 'dark-mode': isDarkMode }">
		<view class="page-header">
			<view class="header-content">
				<view class="title-section">
					<text class="title">亲子商城</text>
					<text class="subtitle">用积分兑换心仪礼品</text>
				</view>
				<view class="points">{{ totalScore }}积分</view>
			</view>

			<!-- 宝宝选择器区域 -->
			<view class="baby-selector">
				<picker :range="babies" range-key="name" @change="onBabyChange">
					<view class="baby-select-view">
						<!-- <text class="baby-select-text">当前宝宝：</text> -->
						<image v-if="currentBabyAvatar" class="baby-icon" :src="currentBabyAvatar" mode="aspectFill">
						</image>
						<text v-else class="baby-icon-placeholder">{{ getDefaultAvatar(currentBabyId) }}</text>
						<text class="baby-name">{{ currentBabyName }}</text>
						<text class="baby-arrow">▼</text>
					</view>
				</picker>
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
				<view class="product-card" v-for="(item, index) in (products || [])" :key="index"
					@tap="goToProductDetail(item, index)">
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
	import { ref, onMounted, onUnmounted, computed } from 'vue';
	import { useThemeStore } from '@/stores/theme';
	import { useShopStore } from '@/stores/shopStore';
	import { usePointsStore } from '@/stores/pointsStore';
	import { isDarkTheme } from '@/utils/themeUtils.js';
	import { verifyAuth } from '@/utils/authUtils';

	export default {
		setup() {
			const themeStore = useThemeStore();
			const shopStore = useShopStore();
			const pointsStore = usePointsStore();
			const isDarkMode = ref(false);
			const totalScore = ref(0);
			const products = ref([]);
			const searchKeyword = ref('');

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

			const getDefaultAvatar = (babyId) => {
				// 基于宝宝ID返回一个默认表情头像
				// 使用宝宝ID的最后一个字符作为随机种子
				const lastChar = babyId ? babyId.charAt(babyId.length - 1) : '0';
				const lastDigit = parseInt(lastChar, 16) % 5; // 获取0-4的值

				console.log('shop默认头像:', babyId, lastDigit);

				// 定义几个可爱的表情作为默认头像
				const defaultAvatars = ['👶', '👼', '🧒', '👦', '👧'];
				return defaultAvatars[lastDigit];
			};

			const currentBabyAvatar = computed(() => {
				const baby = babies.value.find(b => b.id === currentBabyId.value);
				let avatar = baby ? baby.avatar : '';

				console.log('当前宝宝头像:', avatar, '宝宝ID:', currentBabyId.value);

				// 检查是否为Blob URL，可能是无效的
				if (avatar && avatar.startsWith('blob:')) {
					console.log('检测到Blob类型头像，可能无效，改用emoji表情代替');
					// Blob URL可能已失效，返回null表示没有有效头像
					return null;
				}

				// 非Blob URL的普通URL头像
				if (avatar && !avatar.startsWith('blob:')) {
					console.log('当前宝宝头像:', avatar, '宝宝ID:', currentBabyId.value);
					return avatar;
				}

				// 无头像或头像无效
				console.log('宝宝无有效头像，使用默认表情');
				return null;
			});


			// 清除搜索内容
			const clearSearch = () => {
				searchKeyword.value = '';
				// 清空搜索关键词后重新加载商品列表
				loadProducts();
			};

			// 搜索商品
			const searchProducts = () => {
				console.log(`[商城] 执行搜索: ${searchKeyword.value}`);
				
				// 使用Pinia中的搜索方法
				if (!searchKeyword.value.trim()) {
					// 搜索关键词为空，加载所有商品
					products.value = shopStore.sortedProducts;
					return;
				}
				
				products.value = shopStore.searchProducts(searchKeyword.value);
				
				// 显示搜索结果提示
				uni.showToast({
					title: `找到${products.value.length}个商品`,
					icon: 'none',
					duration: 1500
				});
				
				console.log(`[商城] 搜索结果: 找到${products.value.length}个商品`);
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
				// 使用Pinia加载商品
				if (!shopStore.isLoaded) {
					shopStore.loadProducts();
				}
				
				// 如果有搜索关键词，则使用搜索结果
				if (searchKeyword.value.trim()) {
					products.value = shopStore.searchProducts(searchKeyword.value);
					console.log(`[商城] 加载商品并过滤: ${searchKeyword.value}, 结果: ${products.value.length}个`);
				} else {
					// 否则使用排序后的结果
					products.value = shopStore.sortedProducts;
					console.log(`[商城] 加载所有商品: ${products.value.length}个`);
				}
			};

			// 兑换商品
			const exchangeProduct = (product) => {
				if (!product || product.points > totalScore.value) {
					uni.showToast({
						title: '积分不足',
						icon: 'none'
					});
					return;
				}

				// 兑换商品前先验证身份
				verifyAuth(
					// 验证成功回调
					async () => {
						try {
							// 找到商品在列表中的索引
							const productIndex = shopStore.products.findIndex(p => 
								p.name === product.name && 
								p.description === product.description
							);
							
							if (productIndex === -1) {
								console.error('[商城] 未找到要兑换的商品');
								uni.showToast({
									title: '商品不存在',
									icon: 'none'
								});
								return;
							}
							
							// 扣除积分 - 添加更详细的描述
							const description = `兑换商品：${product.name}`;
							const success = await pointsStore.deductBabyPoints(currentBabyId.value, product.points, description);
							if (success) {
								// 减少商品库存
								const exchangeSuccess = shopStore.exchangeProduct(productIndex);
								
								if (!exchangeSuccess && product.stock !== '无限') {
									uni.showToast({
										title: '库存不足',
										icon: 'none'
									});
									return;
								}
								
								// 创建兑换记录
								const exchangeRecord = {
									productName: product.name,
									points: product.points,
									exchangeTime: new Date().toISOString(),
									status: '兑换成功',
									babyId: currentBabyId.value // 添加宝宝ID到兑换记录
								};

								// 保存兑换记录
								const history = JSON.parse(uni.getStorageSync('exchangeHistory') || '[]');
								history.unshift(exchangeRecord);
								uni.setStorageSync('exchangeHistory', JSON.stringify(history));

								// 更新积分显示
								updatePoints();
								
								// 重新加载商品列表（应用排序规则）
								loadProducts();
								
								// 触发商品列表刷新事件
								uni.$emit('refreshProductList');
								
								uni.showToast({
									title: '兑换成功',
									icon: 'success'
								});
							} else {
								uni.showToast({
									title: '积分不足',
									icon: 'none'
								});
							}
						} catch (e) {
							console.error('兑换失败:', e);
							uni.showToast({
								title: '兑换失败，请重试',
								icon: 'none'
							});
						}
					},
					// 验证失败回调
					(error) => {
						console.error('验证失败:', error);
						uni.showToast({
							title: '验证失败，无法兑换商品',
							icon: 'none'
						});
					}
				);
			};

			// 加载宝宝信息
			const loadBabies = () => {
				try {
					// 确保babies总是一个数组
					const storedBabies = uni.getStorageSync('babies') || '[]';
					babies.value = typeof storedBabies === 'string' ? JSON.parse(storedBabies) : (Array.isArray(storedBabies) ? storedBabies : []);

					console.log('商城页面宝宝列表类型:', typeof babies.value, '是否数组:', Array.isArray(babies.value), '数量:', babies.value.length);

					const storedBabyId = uni.getStorageSync('currentBabyId');
					currentBabyId.value = storedBabyId || (babies.value.length > 0 ? babies.value[0].id : '');

					// 如果存在宝宝且未设置当前宝宝ID，设置第一个宝宝为当前宝宝
					if (babies.value.length > 0 && !storedBabyId) {
						uni.setStorageSync('currentBabyId', currentBabyId.value);
					}

					// 更新当前宝宝积分
					updatePoints();
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
					// 记录之前的宝宝ID，用于检测变化
					const oldBabyId = currentBabyId.value;
					const newBabyId = babies.value[idx].id;
					
					// 只有宝宝ID发生变化时才触发更新
					if (oldBabyId !== newBabyId) {
						console.log(`[商城] 切换宝宝: 从[${oldBabyId}]到[${newBabyId}]`);
						
						// 更新本地状态
						currentBabyId.value = newBabyId;
						
						// 同步保存到本地存储
						uni.setStorageSync('currentBabyId', newBabyId);
						
						// 更新积分显示
						updatePoints();
						
						// 用setTimeout确保事件在状态更新后触发
						setTimeout(() => {
							// 广播宝宝切换事件，传递完整宝宝信息
							uni.$emit('babyChanged', {
								babyId: newBabyId,
								babyInfo: babies.value[idx],
								source: 'shop',  // 标记事件来源
								timestamp: Date.now() // 添加时间戳避免重复
							});
							
							// 显示切换提示
							uni.showToast({
								title: `已切换到"${babies.value[idx].name}"`,
								icon: 'none',
								duration: 1500
							});
						}, 50);
						
						console.log('[商城] 已触发宝宝切换事件');
					}
				} else {
					console.error('宝宝切换失败: 无效的索引', idx, '宝宝列表长度:', babies.value.length);
				}
			};

			// 更新积分显示
			const updatePoints = () => {
				if (currentBabyId.value) {
					totalScore.value = pointsStore.getBabyPoints(currentBabyId.value);
				} else {
					totalScore.value = 0;
				}
			};

			// 添加宝宝状态检查函数
			const checkBabyStatus = () => {
				// 从存储中读取当前宝宝ID
				const storedBabyId = uni.getStorageSync('currentBabyId');
				
				// 如果本地状态与存储不一致，更新本地状态
				if (currentBabyId.value !== storedBabyId && storedBabyId) {
					console.log(`[商城] 检测到宝宝状态不一致，从存储同步: ${storedBabyId}`);
					currentBabyId.value = storedBabyId;
					loadBabies();
					updatePoints();
				}
			};

			onMounted(() => {
				// 初始化主题
				if (themeStore.initTheme) {
					themeStore.initTheme();
				}
				
				// 初始化积分Store
				if (pointsStore.init) {
					pointsStore.init();
				}

				// 加载宝宝信息
				loadBabies();

				// 加载商品列表
				loadProducts();

				// 添加积分更新事件监听
				uni.$on('pointsUpdated', updatePoints);

				// 添加宝宝积分更新事件监听
				uni.$on('babyPointsUpdated', (data) => {
					if (data && data.babyId === currentBabyId.value) {
						totalScore.value = data.points;
					}
				});

				// 修改babyChanged事件监听
				uni.$on('babyChanged', (data) => {
					// 检查是否为对象(新格式)或字符串(旧格式)
					const babyId = typeof data === 'object' ? data.babyId : data;
					const source = typeof data === 'object' ? (data.source || 'unknown') : 'unknown';
					
					// 避免自己触发的事件导致循环
					if (source === 'shop') {
						console.log('[商城] 忽略自己触发的宝宝变更事件');
						return;
					}
					
					// 只有当ID变化时才更新
					if (currentBabyId.value !== babyId) {
						console.log(`[商城] 接收到来自[${source}]的宝宝变更事件: ${babyId}`);
						currentBabyId.value = babyId;
						
						// 强制刷新处理
						loadBabies();
						updatePoints();
						
						// 延迟确认
						setTimeout(() => {
							console.log('[商城] 完成宝宝变更响应');
						}, 200);
					}
				});

				// 添加商品列表更新事件监听
				uni.$on('refreshProductList', loadProducts);

				// 添加宝宝列表更新事件监听
				uni.$on('refreshBabyList', () => {
					loadBabies();
					updatePoints();
				});
				
				// 页面加载时主动检查宝宝状态
				checkBabyStatus();
			});

			onUnmounted(() => {
				// 移除事件监听
				uni.$off('pointsUpdated');
				uni.$off('babyPointsUpdated');
				uni.$off('babyChanged');
				uni.$off('refreshProductList');
				uni.$off('refreshBabyList');
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
				goToProductDetail,
				babies,
				currentBabyName,
				onBabyChange,
				currentBabyAvatar,
				getDefaultAvatar,
				currentBabyId,
				checkBabyStatus
			};
		},
		// uni-app生命周期方法作为组件选项
		onShow() {
			// 每次页面显示时检查宝宝状态
			this.checkBabyStatus();
			
			// 加载最新商品数据
			this.loadProducts();
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

	.page-header {
		padding: 140rpx 40rpx 30rpx 40rpx;
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
		height: calc(100vh - 50rpx);
		padding: 0 30rpx 10rpx;
		box-sizing: border-box;
		overflow: hidden;
		position: relative;
		z-index: 1;
	}

	.product-list {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		padding: 10rpx;
		margin-left: 20rpx;
		margin-right: 20rpx;
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
		margin: 0 10rpx;
		font-size: 28rpx;
		font-weight: bold;
		text-align: center;
		color: #333;
		margin-bottom: 10rpx;
		line-height: 1.3;
		width: calc(100% - 30rpx);
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
		/* background-color: rgb(248, 248, 248); */
		margin-bottom: 10rpx;

		height: 90rpx;

		font-size: 24rpx;
		color: #666;
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

	/* 宝宝选择器 */
	.baby-selector {
		margin-top: 20rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		background-color: rgba(255, 255, 255, 0.25);
		border-radius: 40rpx;
		padding: 10rpx 30rpx;
		width: 70%;
		margin-left: auto;
		margin-right: auto;
		box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.15);
	}

	.baby-select-view {
		display: flex;
		align-items: center;
		justify-content: center;
	}


	.baby-select-text {
		font-size: 28rpx;
	}


	.baby-name {
		font-size: 32rpx;
		font-weight: bold;
		color: white;
		margin-right: 10rpx;
		text-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.1);
	}

	.baby-arrow {
		font-size: 24rpx;
		color: rgba(255, 255, 255, 0.8);
	}

	.baby-icon {
		width: 50rpx;
		height: 50rpx;
		border-radius: 50%;
		margin-right: 16rpx;
		border: 2rpx solid #ffffff;
		box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.1);
	}

	.baby-icon-placeholder {
		width: 50rpx;
		height: 50rpx;
		border-radius: 50%;
		margin-right: 16rpx;
		background-color: rgba(255, 255, 255, 0.3);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 32rpx;
		border: 2rpx solid #ffffff;
		box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.1);
	}
</style>