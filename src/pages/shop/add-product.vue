<template>
	<view class="page-container" :class="{ 'dark-mode': isDarkMode }">
		
		<!-- 添加商品模态框 -->
		<view class="modal-mask" v-if="showModal" @tap="cancelAddProduct"></view>
		<view class="modal-base" v-if="showModal" @tap.stop>
			<view class="modal-title">添加新商品</view>
			<view class="modal-input-group">
				<view class="modal-input-label">商品名称:</view>
				<input type="text" v-model="newProduct.name" placeholder="请输入商品名称" class="modal-input" />

				<view class="modal-input-label">所需积分:</view>
				<input type="number" v-model="newProduct.points" placeholder="请输入所需积分" class="modal-input" />

				<view class="modal-input-label">库存数量:</view>
				<input type="text" v-model="newProduct.stock" placeholder="请输入库存数量，无限则填'无限'" class="modal-input" />

				<view class="modal-input-label">商品描述:</view>
				<textarea v-model="newProduct.description" placeholder="请输入商品描述（可选）" class="modal-textarea"></textarea>

				<view class="modal-input-label">图标:</view>
				<view class="icon-picker">
					<view v-for="(icon, i) in availableIcons" :key="i"
						:class="['icon-option', newProduct.icon === icon ? 'selected' : '']" @tap="selectIcon(icon)">
						{{ icon }}</view>
				</view>
			</view>
			<view class="modal-buttons">
				<button class="modal-btn modal-cancel" @tap="cancelAddProduct">取消</button>
				<button class="modal-btn modal-confirm" @tap="addProduct">确认</button>
			</view>
		</view>
	</view>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';
import { useThemeStore } from '@/stores/theme';
import { isDarkTheme } from '@/utils/themeUtils.js';

export default {
	setup() {
		const themeStore = useThemeStore();
		const isDarkMode = ref(false);
		const products = ref([]);
		const showModal = ref(false);
		const newProduct = ref({
			name: '',
			points: '',
			stock: '',
			icon: '🎁',
			description: ''
		});
		const availableIcons = ['🎁', '🎮', '📱', '🎧', '🎯', '🎨', '📚', '🎵', '🏆', '⚽', '🍕', '🎬'];

	
		// 显示添加商品模态框
		const showAddProductModal = () => {
			showModal.value = true;
		};

		// 取消添加商品
		const cancelAddProduct = () => {
			showModal.value = false;
			newProduct.value = {
				name: '',
				points: '',
				stock: '',
				icon: '🎁',
				description: ''
			};
		};

		// 选择图标
		const selectIcon = (icon) => {
			newProduct.value.icon = icon;
		};

		// 保存商品列表到本地存储
		const saveProducts = () => {
			try {
				uni.setStorageSync('shopProducts', JSON.stringify(products.value));
			} catch (e) {
				console.error('保存商品列表失败:', e);
				uni.showToast({
					title: '保存失败，请重试',
					icon: 'none'
				});
			}
		};

		// 添加新商品
		const addProduct = () => {
			// 验证必填字段
			if (!newProduct.value.name) {
				uni.showToast({
					title: '商品名称不能为空',
					icon: 'none'
				});
				return;
			}

			if (!newProduct.value.points || isNaN(Number(newProduct.value.points))) {
				uni.showToast({
					title: '请输入有效的积分数值',
					icon: 'none'
				});
				return;
			}

			if (!newProduct.value.stock) {
				uni.showToast({
					title: '库存不能为空',
					icon: 'none'
				});
				return;
			}

			// 创建新商品对象
			const product = {
				name: newProduct.value.name,
				points: Number(newProduct.value.points),
				stock: newProduct.value.stock,
				icon: newProduct.value.icon,
				description: newProduct.value.description
			};

			// 添加到商品列表
			products.value.unshift(product);

			// 保存到本地存储
			saveProducts();

			// 关闭模态框
			showModal.value = false;

			// 提示添加成功
			uni.showToast({
				title: '商品添加成功',
				icon: 'success'
			});
		};

	
		onMounted(() => {
			// 初始化主题
			if (themeStore.initTheme) {
				themeStore.initTheme();
			}

		});

		onUnmounted(() => {
			// 移除事件监听
			uni.$off('pointsUpdated');
		});

		return {
			isDarkMode,
			products,
			showModal,
			newProduct,
			availableIcons,
			saveProducts,
			showAddProductModal,
			cancelAddProduct,
			selectIcon,
			addProduct
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

.shop-header {
	padding: 40rpx 30rpx 30rpx;
	background: linear-gradient(135deg, #8B5CF6, #7C3AED);
	color: white;
	position: relative;
	box-shadow: 0 6rpx 16rpx rgba(132, 119, 250, 0.2);
}

.dark-mode .shop-header {
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
	font-size: 48rpx;
	font-weight: bold;
	margin-bottom: 10rpx;
	text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
}

.subtitle {
	font-size: 28rpx;
	opacity: 0.9;
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