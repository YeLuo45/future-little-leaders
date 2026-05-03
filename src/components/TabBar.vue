<template>
  <view class="tab-bar">
    <view 
      class="tab-item" 
      :class="{ active: active === 'index' }" 
      @tap="navigateTo('index')">
      <text class="icon">🏠</text>
      <text class="label">首页</text>
    </view>
    <view 
      class="tab-item" 
      :class="{ active: active === 'shop' }" 
      @tap="navigateTo('shop')">
      <text class="icon">🛒</text>
      <text class="label">商城</text>
    </view>
    <view 
      class="tab-item" 
      :class="{ active: active === 'community' }" 
      @tap="navigateTo('community')">
      <text class="icon">👥</text>
      <text class="label">社区</text>
    </view>
    <view 
      class="tab-item" 
      :class="{ active: active === 'profile' }" 
      @tap="navigateTo('profile')">
      <text class="icon">👤</text>
      <text class="label">我的</text>
    </view>
  </view>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'TabBar',
  props: {
    // 当前激活的标签页: 'index', 'shop', 'community', 'profile'
    active: {
      type: String,
      default: 'index'
    }
  },
  setup(props) {
    const navigateTo = (page) => {
      if (page === props.active) return; // 已经在当前页面，不需要跳转
      
      uni.switchTab({
        url: `/pages/${page}/${page}`
      });
    };

    return {
      navigateTo
    };
  }
});
</script>

<style>
/* 底部导航栏 */
.tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100rpx;
  background-color: white;
  display: flex;
  justify-content: space-around;
  align-items: center;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
  z-index: 100;
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  height: 100%;
}

.tab-item.active {
  color: #8477fa;
}

.tab-item.active .icon {
  transform: scale(1.1);
}

.icon {
  font-size: 40rpx;
  margin-bottom: 4rpx;
  transition: transform 0.3s ease;
}

.label {
  font-size: 24rpx;
}
</style> 