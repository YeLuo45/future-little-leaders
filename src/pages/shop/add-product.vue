<!-- 添加任务页面 -->
<template>
  <view class="page-container">
    <!-- 顶部导航栏 -->
    <view class="nav-bar">
      <view class="nav-left" @tap="goBack">
        <text class="nav-icon">←</text>
      </view>
      <text class="nav-title">添加商品</text>
    </view>

    <!-- 表单内容 -->
    <view class="form-container">
      <!-- 商品名称 -->
      <view class="form-item">
        <text class="form-label">商品名称</text>
        <input class="form-input" v-model="newProduct.name" placeholder="请输入商品名称" placeholder-class="placeholder" />
      </view>

      <!-- 商品标签 -->
      <view class="form-item">
        <text class="form-label">商品标签</text>
        <view class="icons-container">
          <view v-for="(tag, index) in availableTags" :key="index" class="tag-item" :class="[
            `tag-${getTagColorClass(tag)}`,
            { 'selected': newProduct.tags.includes(tag) }
          ]" @tap="toggleTag(tag)">
            {{ tag }}
          </view>
        </view>
      </view>

      <!-- 商品积分 -->
      <view class="form-item">
        <text class="form-label">所需积分</text>
        <input class="form-input" v-model="newProduct.points" type="number" placeholder="请输入所需积分"
          placeholder-class="placeholder" />
      </view>


      <!-- 库存数量 -->
      <view class="form-item">
        <text class="form-label">库存数量</text>
        <input class="form-input" v-model="newProduct.total" type="number" placeholder="请输入任务时长"
          placeholder-class="placeholder" />
      </view>

       <!-- 商品描述 -->
       <view class="form-item">
        <text class="form-label">商品描述</text>
        <input class="form-input" v-model="newProduct.description" type="number" placeholder="请输入商品描述（可选）"
          placeholder-class="placeholder" />
      </view>

       <!-- 图标 -->
       <view class="form-item">
        <text class="form-label">图标</text>
        <view class="icon-picker">
					<view v-for="(icon, i) in availableIcons" :key="i"
						:class="['icon-option', newProduct.icon === icon ? 'selected' : '']" @tap="selectIcon(icon)">
						{{ icon }}</view>
				</view>
      </view>

      
    </view>

    <!-- 提交按钮 -->
    <view class="submit-btn-container">
      <button class="modal-btn modal-cancel" @tap="cancelAddProduct">取消</button>
				<button class="modal-btn modal-confirm" @tap="addProduct">确认</button>
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


 /* 导航栏样式 */
 .nav-bar {
    position: sticky;
    top: 0;
    display: flex;
    align-items: center;
    height: 88rpx;
    /* background-color: #fff; */
    background: linear-gradient(135deg, #8B5CF6, #7C3AED);
    padding: 10rpx 30rpx 20rpx 10rpx;
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
    z-index: 100;
  }




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



.nav-left {
    padding: 20rpx;
    margin-left: -20rpx;
  }

  .nav-icon {
    font-size: 40rpx;
    color: #333;
  }

  .nav-title {
    flex: 1;
    text-align: center;
    font-size: 32rpx;
    font-weight: 500;
    color: white;
  }

  /* 表单容器 */
  .form-container {
    padding: 30rpx;
    background-color: #fff;
    margin-top: 20rpx;
    border-radius: 20rpx;
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
  }

  .form-item {
    margin-bottom: 30rpx;
  }

  .form-label {
    display: block;
    font-size: 28rpx;
    color: #333;
    margin-bottom: 16rpx;
  }

  .form-input {
    width: 100%;
    height: 80rpx;
    background-color: #f5f5f5;
    border-radius: 12rpx;
    padding: 0 20rpx;
    font-size: 28rpx;
    color: #333;
  }

  .placeholder {
    color: #999;
  }

  /* icon样式 */
  .icons-container {
    display: flex;
    flex-wrap: wrap;
    gap: 20rpx;
	  /* margin-bottom: 30rpx; */
}
  }

  .tag-item {
    padding: 12rpx 24rpx;
    border-radius: 30rpx;
    font-size: 26rpx;
    color: #fff;
    background-color: #8477fa;
    transition: all 0.3s;
  }

  .tag-item.selected {
    transform: scale(1.05);
    box-shadow: 0 4rpx 12rpx rgba(132, 119, 250, 0.3);
    color: black;
  }

  /* 标签颜色 */
  .tag-education {
    background-color: #4CAF50;
  }

  .tag-cognitive {
    background-color: #2196F3;
  }

  .tag-health {
    background-color: #F44336;
  }

  .tag-fitness {
    background-color: #FF9800;
  }

  .tag-nutrition {
    background-color: #9C27B0;
  }

  .tag-sleep {
    background-color: #607D8B;
  }

  .tag-language {
    background-color: #E91E63;
  }

  .tag-growth {
    background-color: #00BCD4;
  }

  .tag-default {
    background-color: #8477fa;
  }

  /* 任务类型选择器 */
  .type-selector {
    display: flex;
    gap: 20rpx;
  }

  .type-item {
    flex: 1;
    height: 80rpx;
    line-height: 80rpx;
    text-align: center;
    background-color: #f5f5f5;
    border-radius: 12rpx;
    font-size: 28rpx;
    color: #666;
    transition: all 0.3s;
  }

  .type-item.selected {
    background: linear-gradient(135deg, #8B5CF6, #7C3AED);
    color: #fff;
  }

  /* 重复周期选择器 */
  .recurring-selector {
    display: flex;
    flex-wrap: wrap;
    gap: 20rpx;
    margin-bottom: 20rpx;
  }

  .recurring-item {
    flex: 1;
    min-width: 140rpx;
    height: 80rpx;
    line-height: 80rpx;
    text-align: center;
    background-color: #f5f5f5;
    border-radius: 12rpx;
    font-size: 28rpx;
    color: #666;
    transition: all 0.3s;
  }

  .recurring-item.selected {
    background: linear-gradient(135deg, #8B5CF6, #7C3AED);
    color: #fff;
  }

  /* 星期选择器 */
  .weekday-selector {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;
  }

  .weekday-item {
    width: 80rpx;
    height: 80rpx;
    line-height: 80rpx;
    text-align: center;
    background-color: #f5f5f5;
    border-radius: 12rpx;
    font-size: 26rpx;
    color: #666;
    transition: all 0.3s;
  }

  .weekday-item.selected {
    background: linear-gradient(135deg, #8B5CF6, #7C3AED);
    color: #fff;
  }

  /* 日期选择器 */
  .monthday-selector {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;
  }

  .monthday-item {
    width: 80rpx;
    height: 80rpx;
    line-height: 80rpx;
    text-align: center;
    background-color: #f5f5f5;
    border-radius: 12rpx;
    font-size: 26rpx;
    color: #666;
    transition: all 0.3s;
  }

  .monthday-item.selected {
    background: linear-gradient(135deg, #8B5CF6, #7C3AED);
    color: #fff;
  }

  /* 自定义时间选择器 */
  .custom-time {
    display: flex;
    flex-direction: column;
    gap: 20rpx;
  }

  .time-input {
    display: flex;
    align-items: center;
    gap: 20rpx;
  }

  .time-input text {
    font-size: 28rpx;
    color: #666;
  }

  .picker-value {
    flex: 1;
    height: 80rpx;
    line-height: 80rpx;
    background-color: #f5f5f5;
    border-radius: 12rpx;
    padding: 0 20rpx;
    font-size: 28rpx;
    color: #333;
  }

  /* 提交按钮 */
  .submit-btn-container {
    padding: 40rpx 30rpx;
  }

  .submit-btn {
    width: 100%;
    height: 88rpx;
    line-height: 88rpx;
    background: linear-gradient(135deg, #8B5CF6, #7C3AED);
    color: white;
    font-size: 32rpx;
    border-radius: 44rpx; 
    border: none;
    box-shadow: 0 6rpx 16rpx rgba(132, 119, 250, 0.3);
  }

  .submit-btn[disabled] {
    /* transform: translateY(2rpx); */
    background: linear-gradient(135deg, #9f8eff, #8477fa);
    box-shadow: none;
    color: #666;
  }


</style>