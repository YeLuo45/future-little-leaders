# 多宝宝积分系统技术文档

## 1. 功能概述

多宝宝积分系统允许用户为每个宝宝独立管理积分，包括积分获取、消费和查询。系统设计考虑了向后兼容性，保证已有数据不会丢失。

## 2. 技术实现

### 2.1 数据结构

**宝宝积分存储格式**：
- 键名格式：`babyScore_{babyId}`
- 值类型：Number（整数）

**兑换记录结构**：
```javascript
{
  productName: String,   // 商品名称
  points: Number,        // 消费积分数
  exchangeTime: String,  // 兑换时间
  status: String,        // 兑换状态
  babyId: String         // 宝宝ID
}
```

### 2.2 API 函数介绍

#### 基础函数

| 函数名 | 参数 | 返回值 | 功能描述 |
|-------|------|-------|---------|
| getCurrentBabyId | 无 | String | 获取当前选中的宝宝ID |
| getBabyPoints | (babyId?: String) | Number | 获取指定宝宝的积分，不指定则获取当前宝宝积分 |
| updateBabyPoints | (points: Number, babyId?: String) | void | 更新指定宝宝的积分 |
| addBabyPoints | (amount: Number, babyId?: String) | void | 为指定宝宝增加积分 |
| deductBabyPoints | (amount: Number, babyId?: String) | Boolean | 为指定宝宝减少积分，返回是否成功 |

#### 兼容函数

| 函数名 | 参数 | 返回值 | 功能描述 |
|-------|------|-------|---------|
| addPoints | (amount: Number) | void | 为当前宝宝增加积分（同时兼容旧版本） |
| deductPoints | (amount: Number) | Boolean | 为当前宝宝减少积分（同时兼容旧版本），返回是否成功 |

### 2.3 事件系统

| 事件名 | 数据格式 | 功能描述 |
|-------|---------|---------|
| pointsUpdated | Number | 积分更新事件（兼容旧版本） |
| babyPointsUpdated | {babyId: String, points: Number} | 宝宝积分更新事件 |
| babyChanged | String | 宝宝切换事件，传递新的宝宝ID |
| refreshBabyList | 无 | 宝宝列表刷新事件 |

## 3. 使用示例

### 3.1 获取/更新宝宝积分

```javascript
import { getBabyPoints, addBabyPoints } from '@/utils/pointsManager';

// 获取当前宝宝积分
const points = getBabyPoints();

// 为指定宝宝增加积分
addBabyPoints(50, 'baby123');
```

### 3.2 监听积分变更

```javascript
onMounted(() => {
  // 监听宝宝积分更新事件
  uni.$on('babyPointsUpdated', (data) => {
    if (data.babyId === currentBabyId.value) {
      // 更新当前宝宝积分显示
      babyPoints.value = data.points;
    }
  });
});

onUnmounted(() => {
  // 移除事件监听
  uni.$off('babyPointsUpdated');
});
```

### 3.3 切换宝宝时更新积分

```javascript
const onBabyChange = (babyId) => {
  // 更新当前宝宝ID
  currentBabyId.value = babyId;
  
  // 更新积分显示
  totalScore.value = getBabyPoints(babyId);
  
  // 广播宝宝切换事件
  uni.$emit('babyChanged', babyId);
};
```

## 4. 向后兼容性

系统设计确保向后兼容性：

1. 保留原有的`totalScore`存储键，同时作为`babyScore_{currentBabyId}`的镜像
2. 维持原有API函数签名不变，内部实现转向使用宝宝积分系统
3. 对于没有`babyId`的任务和兑换记录，默认在过滤时包含显示

## 5. 注意事项

1. 每次切换宝宝后，需要及时更新页面显示的积分
2. 添加新宝宝时，默认初始积分为0
3. 页面组件应监听`babyChanged`事件以同步更新状态
4. 移除页面时务必解绑相关事件监听 