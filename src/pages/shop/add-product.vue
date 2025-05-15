<!-- 添加商品页面 -->
<template>
  <view class="page-container">
    <!-- 顶部导航栏 -->
    <view class="nav-bar">
      <view class="nav-left" @tap="goBack">
        <text class="icon">←</text>
      </view>
      <text class="nav-title">添加商品</text>
    </view>

    <!-- 表单内容 -->
    <view class="form-container">
      <!-- 商品名称 -->
      <view class="form-item">
        <text class="form-label">商品名称</text>
        <input class="form-input" v-model="productForm.name" placeholder="请输入商品名称" placeholder-class="placeholder" />
      </view>

      <!-- 所需积分 -->
      <view class="form-item">
        <text class="form-label">所需积分</text>
        <input class="form-input" v-model="productForm.points" type="number" placeholder="请输入所需积分" placeholder-class="placeholder" />
      </view>

      <!-- 库存数量 -->
      <view class="form-item">
        <text class="form-label">库存数量</text>
        <input class="form-input" v-model="productForm.stock" placeholder="请输入库存数量，无限则填'无限'" placeholder-class="placeholder" />
      </view>

      <!-- 商品描述 -->
      <view class="form-item">
        <text class="form-label">商品描述</text>
        <textarea class="form-textarea" v-model="productForm.description" placeholder="请输入商品描述（可选）" placeholder-class="placeholder"></textarea>
      </view>

      <!-- 商品图标 -->
      <view class="form-item">
        <text class="form-label">商品图标</text>
        <view class="icon-picker">
          <view v-for="(icon, index) in availableIcons" :key="index" 
            :class="['icon-option', productForm.icon === icon ? 'selected' : '']" 
            @tap="selectIcon(icon)">
            {{ icon }}
          </view>
        </view>
      </view>
    </view>

    <!-- 提交按钮 -->
    <view class="submit-btn-container">
      <button class="submit-btn" @tap="submitProduct" :disabled="!isFormValid">
        创建商品
      </button>
    </view>
  </view>
</template>

<script>
import { ref, computed } from 'vue';
import { verifyAuth } from '@/utils/authUtils';

export default {
  setup() {
    // 可选图标列表
    const availableIcons = ['🎁', '🎮', '📱', '🎧', '🎯', '🎨', '📚', '🎵', '🏆', '⚽', '🍕', '🎬'];

    // 表单数据
    const productForm = ref({
      name: '',
      points: '',
      stock: '',
      icon: '🎁',
      description: ''
    });

    // 表单验证
    const isFormValid = computed(() => {
      return productForm.value.name && 
             productForm.value.points > 0 && 
             productForm.value.stock;
    });

    // 选择图标
    const selectIcon = (icon) => {
      productForm.value.icon = icon;
    };

    // 返回上一页
    const goBack = () => {
      uni.navigateBack();
    };

    // 提交商品
    const submitProduct = () => {
      if (!isFormValid.value) {
        uni.showToast({
          title: '请完善商品信息',
          icon: 'none'
        });
        return;
      }

      // 添加商品前先验证身份
      verifyAuth(
        // 验证成功回调
        () => {
          try {
            // 从本地存储获取现有商品列表
            let products = uni.getStorageSync('shopProducts') || '[]';
            products = JSON.parse(products);

            // 创建新商品对象
            const newProduct = {
              name: productForm.value.name,
              points: Number(productForm.value.points),
              stock: productForm.value.stock,
              icon: productForm.value.icon,
              description: productForm.value.description
            };

            // 添加到商品列表
            products.unshift(newProduct);

            // 保存到本地存储
            uni.setStorageSync('shopProducts', JSON.stringify(products));

            uni.showToast({
              title: '商品添加成功',
              icon: 'success'
            });

            // 返回上一页并刷新
            setTimeout(() => {
              uni.navigateBack({
                delta: 1,
                success: () => {
                  // 触发商城页面刷新
                  uni.$emit('refreshProductList');
                }
              });
            }, 1500);
          } catch (e) {
            console.error('保存商品失败:', e);
            uni.showToast({
              title: '创建失败，请重试',
              icon: 'none'
            });
          }
        },
        // 验证失败回调
        (error) => {
          console.error('验证失败:', error);
          uni.showToast({
            title: '验证失败，无法添加商品',
            icon: 'none'
          });
        }
      );
    };

    return {
      productForm,
      availableIcons,
      isFormValid,
      selectIcon,
      goBack,
      submitProduct
    };
  }
};
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  background-color: #f8f8f8;
  padding-bottom: 40rpx;
}

/* 导航栏样式 */
.nav-bar {
	display: flex;
	align-items: center;
	height: 88rpx;
	background: linear-gradient(135deg, #8B5CF6, #7C3AED);
	padding: 60rpx 40rpx 60rpx 40rpx;
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

.form-textarea {
  width: 100%;
  height: 160rpx;
  background-color: #f5f5f5;
  border-radius: 12rpx;
  padding: 20rpx;
  font-size: 28rpx;
  color: #333;
}

.placeholder {
  color: #999;
}

/* 图标选择器样式 */
.icon-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
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
  transition: all 0.3s;
}

.icon-option.selected {
  border-color: #8477fa;
  background-color: rgba(132, 119, 250, 0.1);
  transform: scale(1.05);
  box-shadow: 0 4rpx 12rpx rgba(132, 119, 250, 0.2);
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
  transition: all 0.3s;
}

.submit-btn:active {
  transform: translateY(2rpx);
  box-shadow: 0 2rpx 8rpx rgba(132, 119, 250, 0.2);
}

.submit-btn[disabled] {
  background: linear-gradient(135deg, #9f8eff, #8477fa);
  box-shadow: none;
  color: #666;
}
</style> 