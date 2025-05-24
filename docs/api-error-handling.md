# 积分系统API错误处理指南

## 常见错误场景

### 1. 宝宝ID不存在

**场景描述**：尝试为不存在的宝宝ID增加或查询积分

**处理方法**：
```javascript
try {
  const points = getBabyPoints('non-existent-id');
  // 处理正常逻辑
} catch (e) {
  console.error('读取宝宝积分失败:', e);
  // 返回默认值或提示用户
  return 0;
}
```

### 2. 本地存储访问失败

**场景描述**：无法读取或写入本地存储

**处理方法**：
```javascript
try {
  updateBabyPoints(100, babyId);
} catch (e) {
  console.error('更新宝宝积分失败:', e);
  uni.showToast({
    title: '积分更新失败，请重试',
    icon: 'none'
  });
}
```

### 3. 宝宝切换事件处理错误

**场景描述**：宝宝切换事件处理过程中发生错误

**处理方法**：
```javascript
try {
  uni.$on('babyChanged', (babyId) => {
    if (!babyId) {
      console.warn('收到无效的宝宝ID');
      return;
    }
    currentBabyId.value = babyId;
    updatePoints(babyId);
  });
} catch (e) {
  console.error('宝宝切换事件处理错误:', e);
}
```

### 4. 积分不足

**场景描述**：用户尝试兑换积分不足的商品

**处理方法**：
```javascript
const success = deductBabyPoints(amount, babyId);
if (success) {
  // 兑换成功逻辑
} else {
  uni.showToast({
    title: '积分不足',
    icon: 'none'
  });
}
```

## 最佳实践

1. **始终使用try-catch处理本地存储操作**：
   ```javascript
   try {
     // 本地存储操作
   } catch (e) {
     console.error('操作失败:', e);
     // 错误处理
   }
   ```

2. **提供合理的默认值**：
   ```javascript
   const points = getBabyPoints(babyId) || 0;
   ```

3. **验证输入参数**：
   ```javascript
   function addBabyPoints(amount, babyId) {
     if (!babyId) {
       console.error('无效的宝宝ID');
       return false;
     }
     if (isNaN(amount) || amount <= 0) {
       console.error('无效的积分数量');
       return false;
     }
     // 正常逻辑
   }
   ```

4. **解绑事件监听**：
   ```javascript
   onUnmounted(() => {
     uni.$off('babyPointsUpdated');
     uni.$off('babyChanged');
   });
   ```

5. **处理并发情况**：
   ```javascript
   // 使用一个标志位防止重复操作
   let isUpdating = false;
   
   function safeUpdatePoints(points, babyId) {
     if (isUpdating) return;
     
     isUpdating = true;
     try {
       updateBabyPoints(points, babyId);
     } catch (e) {
       console.error('更新失败:', e);
     } finally {
       isUpdating = false;
     }
   }
   ```