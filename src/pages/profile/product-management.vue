<template>
	<view class="page-container" :class="{ 'dark-mode': isDarkMode }">
		<!-- 顶部导航栏 -->
		<view class="nav-bar" :class="{ 'dark-mode': isDarkMode }">
			<view class="nav-left" @tap="goBack">
				<text class="icon">←</text>
			</view>
			<view class="nav-title">商品管理</view>
		</view>

		<!-- 商品列表 -->
		<view class="products-list">
			<view v-if="products.length === 0" class="empty-list">
				<text>暂无商品</text>
			</view>
			<view v-else class="product-item" v-for="(item, index) in products" :key="index"
				:class="{ 'dark-mode': isDarkMode }">
				<view class="product-info">
					<view class="product-icon">{{ item.icon || '🎁' }}</view>
					<view class="product-details">
						<view class="product-name">{{ item.name }}</view>
						<view class="product-description">{{ item.description || '暂无描述' }}</view>
						<view class="product-meta">
							<text class="product-points">{{ item.points }}积分</text>
							<text class="product-stock"
								:class="{ 'stock-unlimited': item.stock === '无限', 'stock-empty': item.stock === 0 || item.stock === '0' }">
								{{ item.stock === '无限' ? '库存: 无限' : `库存: ${item.stock}` }}
							</text>
						</view>
					</view>
				</view>
				<view class="product-actions">
					<view class="action-btn edit-btn" @tap="editStock(index)">修改库存</view>
					<view class="action-btn delete-btn" @tap="deleteProduct(index)">删除</view>
				</view>
			</view>
		</view>

		<!-- 底部提示 -->
		<view class="bottom-tip" :class="{ 'dark-mode': isDarkMode }">
			<text>提示: 您可以在"商城"页面添加新商品</text>
		</view>

		<!-- 修改库存弹窗 -->
		<view class="stock-popup" v-if="showStockPopup">
			<view class="stock-popup-mask" @tap="cancelEdit"></view>
			<view class="stock-popup-content" :class="{ 'dark-mode': isDarkMode }">
				<view class="stock-popup-title">修改库存</view>
				<input class="stock-input" :class="{ 'dark-mode': isDarkMode }" v-model="editStockValue"
					placeholder="请输入库存数量，输入'无限'表示无限库存" focus="true" />
				<view class="stock-popup-buttons">
					<view class="stock-popup-button cancel" @tap="cancelEdit">取消</view>
					<view class="stock-popup-button confirm" @tap="confirmStockEdit(editStockValue)">确定</view>
				</view>
			</view>
		</view>

		<!-- 浮动添加按钮 -->
		<view class="float-btn" :class="{ 'dark-mode': isDarkMode }" @tap="goToAddProduct">
			<text>＋</text>
		</view>
	</view>
</template>

<script setup>
	import { ref, computed, onMounted } from 'vue';
	import { isDarkTheme } from '@/utils/themeUtils.js';
	import { useShopStore } from '@/stores/shopStore';
	import { verifyAuth } from '@/utils/authUtils';

	// 暗黑模式
	const isDarkMode = ref(false);
	// 商品数据
	const shopStore = useShopStore();
	const products = computed(() => shopStore.sortedProducts);
	// 当前编辑的商品索引
	const currentEditIndex = ref(-1);
	// 编辑库存的值
	const editStockValue = ref('');
	// 弹窗状态
	const showStockPopup = ref(false);

	// 返回上一页
	function goBack() {
		uni.navigateBack();
	}

	// 跳转到添加商品页面
	function goToAddProduct() {
		uni.navigateTo({
			url: '/pages/shop/add-product'
		});
	}

	// 修改库存
	function editStock(index) {
		currentEditIndex.value = index;
		const product = shopStore.products[index];
		editStockValue.value = product.stock;
		// 显示自定义弹窗
		showStockPopup.value = true;
	}

	// 确认修改库存
	function confirmStockEdit(value) {
		if (currentEditIndex.value === -1) return;

		// 处理库存值
		let stockValue = value;
		if (value.toLowerCase() === '无限') {
			stockValue = '无限';
		} else {
			// 尝试转换为数字
			const numValue = parseInt(value);
			if (isNaN(numValue) || numValue < 0) {
				uni.showToast({
					title: '请输入有效的数字',
					icon: 'none'
				});
				return;
			}
			stockValue = numValue.toString();
		}

		// 更新库存
		const success = shopStore.updateProductStock(currentEditIndex.value, stockValue);
		if (success) {
			uni.showToast({
				title: '库存修改成功',
				icon: 'success'
			});

			// 通知商品列表更新
			uni.$emit('refreshProductList');
		} else {
			uni.showToast({
				title: '库存修改失败',
				icon: 'none'
			});
		}

		// 关闭弹窗并重置索引
		showStockPopup.value = false;
		currentEditIndex.value = -1;
	}

	// 取消编辑
	function cancelEdit() {
		showStockPopup.value = false;
		currentEditIndex.value = -1;
	}

	// 删除商品
	function deleteProduct(index) {
		uni.showModal({
			title: '确认删除',
			content: '确定要删除这个商品吗？此操作不可撤销。',
			success: (res) => {
				if (res.confirm) {
					const success = shopStore.deleteProduct(index);
					if (success) {
						uni.showToast({
							title: '删除成功',
							icon: 'success'
						});

						// 通知商品列表更新
						uni.$emit('refreshProductList');
					} else {
						uni.showToast({
							title: '删除失败',
							icon: 'none'
						});
					}
				}
			}
		});
	}

	// 页面加载
	onMounted(() => {
		isDarkMode.value = isDarkTheme();

		// 确保商品数据已加载
		if (!shopStore.isLoaded) {
			shopStore.loadProducts();
		}
	});
</script>

<style>
	.page-container {
		min-height: 100vh;
		background-color: #f5f5f5;
		padding-bottom: 120rpx;
	}

	.page-container.dark-mode {
		background-color: #121212;
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

	.products-list {
		padding: 30rpx;
	}

	.empty-list {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 200rpx;
		background-color: white;
		border-radius: 16rpx;
		margin-bottom: 30rpx;
		color: #999;
		font-size: 28rpx;
	}

	.product-item {
		background-color: white;
		border-radius: 16rpx;
		margin-bottom: 30rpx;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
		overflow: hidden;
	}

	.product-item.dark-mode {
		background-color: #1f1f1f;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.2);
	}

	.product-info {
		padding: 30rpx;
		display: flex;
		align-items: center;
	}

	.product-icon {
		width: 100rpx;
		height: 100rpx;
		background-color: #f8f8f8;
		border-radius: 16rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 48rpx;
		margin-right: 20rpx;
	}

	.dark-mode .product-icon {
		background-color: #2a2a2a;
	}

	.product-details {
		flex: 1;
	}

	.product-name {
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 10rpx;
	}

	.dark-mode .product-name {
		color: #e0e0e0;
	}

	.product-description {
		font-size: 26rpx;
		color: #666;
		margin-bottom: 20rpx;
		line-height: 1.4;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		overflow: hidden;
	}

	.dark-mode .product-description {
		color: #aaa;
	}

	.product-meta {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.product-points {
		font-size: 26rpx;
		color: #8477fa;
		font-weight: bold;
	}

	.dark-mode .product-points {
		color: #9f8eff;
	}

	.product-stock {
		font-size: 26rpx;
		color: #333;
	}

	.dark-mode .product-stock {
		color: #e0e0e0;
	}

	.stock-unlimited {
		color: #52c41a;
	}

	.dark-mode .stock-unlimited {
		color: #73d13d;
	}

	.stock-empty {
		color: #ff4d4f;
	}

	.dark-mode .stock-empty {
		color: #ff7875;
	}

	.product-actions {
		display: flex;
		border-top: 1rpx solid #f0f0f0;
	}

	.dark-mode .product-actions {
		border-top: 1rpx solid #333;
	}

	.action-btn {
		flex: 1;
		height: 80rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 28rpx;
	}

	.edit-btn {
		color: #8477fa;
		border-right: 1rpx solid #f0f0f0;
	}

	.dark-mode .edit-btn {
		color: #9f8eff;
		border-right: 1rpx solid #333;
	}

	.delete-btn {
		color: #ff4d4f;
	}

	.dark-mode .delete-btn {
		color: #ff7875;
	}

	.bottom-tip {
		text-align: center;
		padding: 30rpx;
		color: #999;
		font-size: 24rpx;
	}

	.dark-mode .bottom-tip {
		color: #777;
	}

	/* 浮动添加按钮 */
	.float-btn {
		position: fixed;
		right: 40rpx;
		bottom: 120rpx;
		width: 100rpx;
		height: 100rpx;
		background: linear-gradient(135deg, #8B5CF6, #7C3AED);
		color: white;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 60rpx;
		box-shadow: 0 4rpx 16rpx rgba(132, 119, 250, 0.3);
		z-index: 100;
		transition: transform 0.2s ease;
	}

	.float-btn:active {
		transform: scale(0.95);
	}

	/* 自定义弹窗样式 */
	.stock-popup {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 999;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.stock-popup-mask {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.5);
	}

	.stock-popup-content {
		width: 80%;
		background-color: #fff;
		border-radius: 16rpx;
		padding: 40rpx;
		position: relative;
		z-index: 1000;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.2);
	}

	.stock-popup-content.dark-mode {
		background-color: #1f1f1f;
	}

	.stock-popup-title {
		font-size: 32rpx;
		font-weight: bold;
		text-align: center;
		margin-bottom: 30rpx;
		color: #333;
	}

	.dark-mode .stock-popup-title {
		color: #e0e0e0;
	}

	.stock-input {
		width: 100%;
		height: 80rpx;
		padding: 0 20rpx;
		background-color: #f5f5f5;
		border-radius: 8rpx;
		margin-bottom: 30rpx;
		font-size: 28rpx;
		color: #333;
		box-sizing: border-box;
	}

	.stock-input.dark-mode {
		background-color: #2a2a2a;
		color: #e0e0e0;
	}

	.stock-popup-buttons {
		display: flex;
		justify-content: space-between;
	}

	.stock-popup-button {
		flex: 1;
		height: 80rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 28rpx;
		border-radius: 8rpx;
	}

	.stock-popup-button.cancel {
		margin-right: 20rpx;
		background-color: #f5f5f5;
		color: #666;
	}

	.dark-mode .stock-popup-button.cancel {
		background-color: #2a2a2a;
		color: #aaa;
	}

	.stock-popup-button.confirm {
		background: linear-gradient(135deg, #8B5CF6, #7C3AED);
		color: #fff;
	}
</style>