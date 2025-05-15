<template>
  <view class="page-container" :class="{'dark-mode': isDarkMode}">
    <!-- 顶部导航栏 -->
    <view class="nav-bar" :class="{'dark-mode': isDarkMode}">
      <view class="nav-left" @tap="goBack">
        <text class="icon">←</text>
      </view>
      <view class="nav-title">商品详情</view>
      <!-- <view class="placeholder"></view> -->
    </view>
    
    <!-- 商品详情内容 -->
    <view class="product-detail" :class="{'dark-mode': isDarkMode}">
      <!-- 商品图标区域 -->
      <view class="product-icon-container">
        <view class="product-icon" :class="{'dark-mode': isDarkMode}">
          {{product.icon}}
        </view>
      </view>
      
      <!-- 商品信息 -->
      <view class="product-info">
        <view class="product-name" :class="{'dark-mode': isDarkMode}">{{product.name}}</view>
        <view class="product-points" :class="{'dark-mode': isDarkMode}">
          <text class="points-label">所需积分</text>
          <text class="points-value">{{product.points}}</text>
        </view>
        <view class="product-stock" :class="{'dark-mode': isDarkMode}">
          <text class="stock-label">库存状态</text>
          <text class="stock-value" :class="{'unlimited': product.stock === '无限'}">
            {{product.stock === '无限' ? '无限' : `剩余${product.stock}个`}}
          </text>
        </view>
      </view>
      
      <!-- 商品描述 -->
      <view class="product-description" :class="{'dark-mode': isDarkMode}">
        <view class="description-title">商品描述</view>
        <view class="description-content">
          <text>{{product.description || '这个商品很神秘，没有留下任何描述...'}}</text>
        </view>
      </view>
      
      <!-- 兑换规则 -->
      <view class="exchange-rules" :class="{'dark-mode': isDarkMode}">
        <view class="rules-title">兑换须知</view>
        <view class="rules-content">
          <view class="rule-item">1. 兑换后积分将立即扣除</view>
          <view class="rule-item">2. 部分商品库存有限，先到先得</view>
          <view class="rule-item">3. 兑换成功后请及时使用</view>
        </view>
      </view>
    </view>
    
    <!-- 底部操作栏 -->
    <view class="bottom-bar" :class="{'dark-mode': isDarkMode}">
      <view class="user-points">
        <text class="points-label">我的积分</text>
        <text class="points-value">{{userPoints}}</text>
      </view>
      <button 
        class="exchange-btn" 
        :class="{'disabled': userPoints < product.points || (product.stock !== '无限' && product.stock <= 0)}"
        @tap="exchangeProduct"
      >
        {{userPoints < product.points ? '积分不足' : (product.stock !== '无限' && product.stock <= 0) ? '库存不足' : '立即兑换'}}
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onLoad, onShow } from '@dcloudio/uni-app';
import { isDarkTheme } from '@/utils/themeUtils.js';
import { getBabyPoints, deductBabyPoints } from '@/utils/pointsManager';

// 暗黑模式
const isDarkMode = ref(false);
// 商品信息
const product = ref({
  name: '',
  points: 0,
  stock: '',
  icon: '🎁',
  description: ''
});
// 用户积分
const userPoints = ref(0);
// 当前宝宝ID
const currentBabyId = ref('');

// 返回上一页
function goBack() {
  uni.navigateBack();
}

// 兑换商品
function exchangeProduct() {
  if (userPoints.value < product.value.points) {
    uni.showToast({ title: '积分不足', icon: 'none' });
    return;
  }
  if (product.value.stock !== '无限' && product.value.stock <= 0) {
    uni.showToast({ title: '库存不足', icon: 'none' });
    return;
  }
  uni.showModal({
    title: '确认兑换',
    content: `是否兑换"${product.value.name}"？将消耗${product.value.points}积分`,
    success: (res) => {
      if (res.confirm) {
        // 获取当前宝宝ID
        const babyId = currentBabyId.value;
        
        // 调用积分管理工具扣除积分
        const success = deductBabyPoints(babyId, product.value.points);
        
        if (success) {
          // 减少库存
          if (product.value.stock !== '无限') {
            product.value.stock -= 1;
          }
          // 获取所有商品
          let allProducts = uni.getStorageSync('shopProducts') || '[]';
          if (typeof allProducts === 'string') {
            allProducts = JSON.parse(allProducts);
          }
          // 更新商品库存
          if (product.value.index !== undefined && allProducts[product.value.index]) {
            allProducts[product.value.index].stock = product.value.stock;
            uni.setStorageSync('shopProducts', JSON.stringify(allProducts));
          }
          
          // 创建兑换记录
          const exchangeRecord = {
            productName: product.value.name,
            points: product.value.points,
            exchangeTime: new Date().toISOString(),
            status: '兑换成功',
            babyId: babyId // 添加宝宝ID到兑换记录
          };

          // 保存兑换记录
          const history = JSON.parse(uni.getStorageSync('exchangeHistory') || '[]');
          history.unshift(exchangeRecord);
          uni.setStorageSync('exchangeHistory', JSON.stringify(history));
          
          // 更新UI显示
          userPoints.value = getBabyPoints(babyId);
          
          // 提示兑换成功
          uni.showToast({ title: '兑换成功', icon: 'success' });
          // 2秒后返回商城页面
          setTimeout(() => {
            goBack();
          }, 2000);
        } else {
          uni.showToast({ title: '兑换失败，积分不足', icon: 'none' });
        }
      }
    }
  });
}

// 页面加载时
onLoad(() => {
  isDarkMode.value = isDarkTheme();
  // 获取商品信息
  const productData = uni.getStorageSync('currentProduct');
  if (productData) {
    product.value = productData;
  } else {
    uni.showToast({ title: '商品信息不存在', icon: 'none' });
    setTimeout(() => {
      goBack();
    }, 1500);
  }
  
  // 获取当前宝宝ID
  currentBabyId.value = uni.getStorageSync('currentBabyId') || '';
  
  // 获取用户积分
  userPoints.value = getBabyPoints(currentBabyId.value);
});

// 页面显示时
onShow(() => {
  isDarkMode.value = isDarkTheme();
  // 更新用户积分
  userPoints.value = getBabyPoints(currentBabyId.value);
});
</script>

<style>
.page-container {
  min-height: 100vh;
  background-color: #f8f8f8;
  display: flex;
  flex-direction: column;
}

.page-container.dark-mode {
  background-color: #121212;
}


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



.placeholder {
  width: 60rpx;
}

.product-detail {
  flex: 1;
  padding: 30rpx;
}

.product-icon-container {
  display: flex;
  justify-content: center;
  margin: 40rpx 0;
}

.product-icon {
  font-size: 140rpx;
  width: 260rpx;
  height: 260rpx;
  border-radius: 40rpx;
  background-color: #f0f0f0;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.1);
}

.product-icon.dark-mode {
  background-color: #2a2a2a;
  box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.3);
}

.product-info {
  background-color: white;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
}

.product-info.dark-mode {
  background-color: #1f1f1f;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.2);
}

.product-name {
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 30rpx;
  text-align: center;
}

.product-name.dark-mode {
  color: #e0e0e0;
}

.product-points, .product-stock {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
  padding-bottom: 20rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.dark-mode .product-points, .dark-mode .product-stock {
  border-bottom-color: #333;
}

.product-stock {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.points-label, .stock-label {
  font-size: 28rpx;
  color: #666;
}

.dark-mode .points-label, .dark-mode .stock-label {
  color: #aaa;
}

.points-value, .stock-value {
  font-size: 32rpx;
  font-weight: bold;
  color: #8477fa;
}

.dark-mode .points-value, .dark-mode .stock-value {
  color: #9f8eff;
}

.stock-value.unlimited {
  color: #52c41a;
}

.dark-mode .stock-value.unlimited {
  color: #73d13d;
}

.product-description, .exchange-rules {
  background-color: white;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
}

.product-description.dark-mode, .exchange-rules.dark-mode {
  background-color: #1f1f1f;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.2);
}

.description-title, .rules-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
  padding-bottom: 20rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.dark-mode .description-title, .dark-mode .rules-title {
  color: #e0e0e0;
  border-bottom-color: #333;
}

.description-content, .rules-content {
  font-size: 28rpx;
  color: #666;
  line-height: 1.6;
}

.dark-mode .description-content, .dark-mode .rules-content {
  color: #aaa;
}

.rule-item {
  margin-bottom: 10rpx;
}

.bottom-bar {
  height: 120rpx;
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30rpx;
  box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.05);
  position: sticky;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 10;
}

.bottom-bar.dark-mode {
  background-color: #1a1a1a;
  box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.2);
}

.user-points {
  display: flex;
  flex-direction: column;
}

.user-points .points-label {
  font-size: 24rpx;
  color: #999;
  margin-bottom: 6rpx;
}

.dark-mode .user-points .points-label {
  color: #777;
}

.user-points .points-value {
  font-size: 40rpx;
  color: #ff9500;
}

.dark-mode .user-points .points-value {
  color: #ffb340;
}

.exchange-btn {
  height: 80rpx;
  padding: 0 60rpx;
  background: linear-gradient(135deg, #9f8eff, #8477fa);
  color: white;
  border-radius: 40rpx;
  font-size: 30rpx;
  font-weight: bold;
  line-height: 80rpx;
  box-shadow: 0 8rpx 16rpx rgba(132, 119, 250, 0.3);
  border: none;
}

.exchange-btn.disabled {
  background: linear-gradient(135deg, #c8c8c8, #a0a0a0);
  box-shadow: 0 8rpx 16rpx rgba(0, 0, 0, 0.1);
}

.exchange-btn:active {
  transform: scale(0.98);
}
</style> 