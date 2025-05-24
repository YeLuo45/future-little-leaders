# 分享功能API文档

## 1. useShare 组合式API

> 推荐所有页面统一用法

### 作用
统一注册页面的分享功能（分享给朋友、分享到朋友圈），自动根据页面和数据生成分享内容。

### 用法
```js
import { useShare } from '@/utils/useShare';

setup() {
  // ...
  useShare('index', () => ({
    currentBabyId: currentBabyId.value,
    babies: babies.value,
    totalScore: totalScore.value,
    ongoingTasks: ongoingTasks.value
  }));
  // ...
}
```

### 参数
- `page`：页面标识（如'index'、'shop'、'statistics'、'profile'）
- `dataGetter`：返回页面分享数据的函数，需返回对象，建议用ref/computed保证响应式

### 说明
- 必须在`setup`中调用
- 自动注册`onShareAppMessage`和`onShareTimeline`，无需手动导出
- 分享内容由`getShareConfig`统一生成

---

## 2. getShareConfig 工具函数

> 低级用法（如需自定义特殊场景可直接调用）

### 用法
```js
import { getShareConfig } from '@/utils/shareUtils';
const config = getShareConfig({
  page: 'index',
  data: { ... }
});
```

### 参数
- `page`：页面标识
- `data`：页面相关数据对象

### 返回
- `{ title, path, imageUrl, query }` 分享配置对象

---

## 3. 支持的页面标识及数据
- `index`：{ currentBabyId, babies, totalScore, ongoingTasks }
- `shop`：{ currentBabyId, babies, totalScore, products }
- `statistics`：{ currentBabyId, babies, totalScore, completionRate }
- `profile`：{ userInfo, currentBabyId, babies, totalScore }

如需扩展新页面，建议在`shareUtils.js`中补充对应case。

---

## 4. 示例
见各页面index.vue/shop.vue/statistics/task-trend.vue/profile.vue的setup用法。

---

## 5. 维护说明
- 推荐所有新页面统一用useShare注册分享
- 旧页面如有自定义onShareAppMessage/onShareTimeline建议迁移
- 统一维护分享内容模板，便于后续产品运营调整

---

## 商品图片与布局

- 商品支持图片上传与图标二选一，表单字段：image（图片URL）/icon（表情）。
- 商品卡片展示优先显示图片，无图片时显示图标。
- 商品卡片支持1/2/3列布局切换，使用layoutType控制。
- 商品图片支持点击放大预览（uni.previewImage）。 