# 积分管理说明

## 重要更新 (2023-10-16)

pointsManager.js 已被移除，所有积分管理功能现在由 Pinia store (pointsStore.js) 统一管理。

### 迁移指南

原来使用 pointsManager.js 的代码需要做以下修改：

1. 将导入语句从:
```js
import { getBabyPoints, addBabyPoints, deductBabyPoints } from '@/utils/pointsManager';
```
修改为:
```js
import { usePointsStore } from '@/stores/pointsStore';
```

2. 在 setup 函数中初始化 pointsStore:
```js
const pointsStore = usePointsStore();

// 在 onMounted 中初始化
onMounted(() => {
  if (pointsStore.init) {
    pointsStore.init();
  }
});
```

3. 将方法调用修改为:
```js
// 旧代码
const points = getBabyPoints(babyId);
addBabyPoints(babyId, 10, '完成任务');
deductBabyPoints(babyId, 50, '兑换商品');

// 新代码
const points = pointsStore.getBabyPoints(babyId);
pointsStore.addBabyPoints(babyId, 10, '完成任务');
pointsStore.deductBabyPoints(babyId, 50, '兑换商品');
```

### 优势

1. **状态集中管理**: 所有积分数据统一由 Pinia 管理
2. **响应式更新**: 数据变化自动触发 UI 更新
3. **便于调试**: 可以使用 Vue DevTools 查看积分状态
4. **完整的积分记录**: 所有积分变更都会被记录，包含详细信息

### 注意事项

- 确保在使用 pointsStore 前已调用其 init 方法
- 对积分的所有修改都应该通过 pointsStore 的方法进行
- 积分记录含有详细的描述信息，请在调用方法时提供准确的描述 