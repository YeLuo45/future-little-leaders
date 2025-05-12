# 积分管理工具说明

`pointsManager.js` 模块提供了用于管理应用中宝宝积分系统的一系列工具函数。

## 主要功能

1. **宝宝积分管理**：为每个宝宝单独管理积分
2. **积分增减操作**：提供添加和扣除积分的功能
3. **事件通知**：当积分变更时，通过事件系统通知应用其他部分

## API 说明

### 宝宝积分相关

- `getBabyPoints(babyId)`: 获取特定宝宝的积分
- `updateBabyPoints(babyId, points)`: 更新特定宝宝的积分
- `addBabyPoints(babyId, points)`: 为特定宝宝添加积分
- `deductBabyPoints(babyId, points)`: 从特定宝宝扣除积分

## 数据存储

积分数据存储在本地存储中：

- 宝宝积分: `babyPointsRecords` 键，存储为JSON对象，格式为 `{ babyId: points }`

## 事件系统

模块通过 uni.$emit 触发以下事件：

- `babyPointsUpdated`: 宝宝积分更新时触发，参数为 `{ babyId, points }`

## 使用示例

```javascript
import { addBabyPoints, deductBabyPoints, getBabyPoints } from '@/utils/pointsManager';

// 添加积分到特定宝宝
const addPointsToCurrentBaby = (points) => {
  const currentBabyId = uni.getStorageSync('currentBabyId');
  if (currentBabyId) {
    addBabyPoints(currentBabyId, points);
  }
};

// 完成任务后奖励积分
const completeTask = (task) => {
  const babyId = uni.getStorageSync('currentBabyId');
  addBabyPoints(babyId, task.points);
};

// 兑换奖品
const exchangeReward = (reward) => {
  const babyId = uni.getStorageSync('currentBabyId');
  const babyPoints = getBabyPoints(babyId);
  
  if (babyPoints >= reward.points) {
    deductBabyPoints(babyId, reward.points);
    return true;
  }
  return false;
};
```

## 注意事项

1. 所有操作都会返回一个布尔值表示成功或失败
2. 扣除积分时会检查积分是否足够，不足则返回false
3. 操作失败时会在控制台输出错误信息
4. 如果不传入babyId，`getBabyPoints`将返回0 