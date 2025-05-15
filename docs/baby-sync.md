# 宝宝数据同步机制文档 (V2)

## 概述
本文档描述了亲子任务应用中宝宝数据的增强同步机制，特别是在多个页面之间切换宝宝时如何保持数据一致性。
通过全局事件代理和状态检查机制，实现了宝宝数据在不同页面间的可靠同步。

## 宝宝切换事件格式

当在任何页面切换当前宝宝时，会触发一个全局事件 `babyChanged`，增强的事件数据格式如下：

```js
{
  babyId: "宝宝ID",
  babyInfo: {
    // 完整的宝宝信息对象
    id: "宝宝ID",
    name: "宝宝名称",
    birthdate: "出生日期",
    avatar: "头像路径",
    // 其他属性...
  },
  source: "页面标识", // 事件来源页面标识，用于避免循环处理
  timestamp: 1630123456789 // 事件触发时间戳，避免重复处理
}
```

## 全局事件代理

为了确保事件的可靠传递，应用在App.vue中实现了全局事件代理：

```js
// App.vue
setupGlobalEventProxy() {
  // 存储原始的uni.$emit方法
  const originalEmit = uni.$emit;
  
  // 重写uni.$emit方法，添加日志并确保事件广播更可靠
  uni.$emit = function(eventName, ...args) {
    console.log(`[全局事件] 触发: ${eventName}`, args[0]);
    
    // 如果是宝宝切换事件，特殊处理
    if (eventName === 'babyChanged') {
      // 保存到全局存储，确保任何时候都能获取最新状态
      const data = args[0];
      const babyId = typeof data === 'object' ? data.babyId : data;
      
      // 同步保存到本地存储
      uni.setStorageSync('currentBabyId', babyId);
      
      // 使用setTimeout确保事件在下一个事件循环处理，增加可靠性
      setTimeout(() => {
        // 调用原始emit方法
        originalEmit.apply(uni, [eventName, ...args]);
      }, 50);
    } else {
      // 其他事件正常处理
      originalEmit.apply(uni, [eventName, ...args]);
    }
  };
}
```

## 页面实现

### 触发宝宝切换

在任何需要触发宝宝切换的函数中（如 `setAsCurrentBaby` 或 `onBabyChange`），增强版实现如下：

```js
const onBabyChange = (e) => {
  const idx = e.detail.value;
  if (babies.value[idx]) {
    // 记录之前的宝宝ID，用于检测变化
    const oldBabyId = currentBabyId.value;
    const newBabyId = babies.value[idx].id;
    
    // 只有宝宝ID发生变化时才触发更新
    if (oldBabyId !== newBabyId) {
      console.log(`[页面标识] 切换宝宝: 从[${oldBabyId}]到[${newBabyId}]`);
      
      // 更新本地状态
      currentBabyId.value = newBabyId;
      
      // 同步保存到本地存储
      uni.setStorageSync('currentBabyId', newBabyId);
      
      // 用setTimeout确保事件在状态更新后触发
      setTimeout(() => {
        // 广播宝宝切换事件，传递完整宝宝信息
        uni.$emit('babyChanged', {
          babyId: newBabyId,
          babyInfo: babies.value[idx],
          source: '页面标识',  // 标记事件来源
          timestamp: Date.now() // 添加时间戳避免重复
        });
        
        // 显示切换提示
        uni.showToast({
          title: `已切换到"${babies.value[idx].name}"`,
          icon: 'none',
          duration: 1500
        });
      }, 50);
      
      // 更新当前页面数据
      updatePoints();
      // 其他必要的刷新...
    }
  }
};
```

### 响应宝宝切换

每个页面都应在 `onMounted` 中监听宝宝切换事件，增强版实现如下：

```js
uni.$on('babyChanged', (data) => {
  // 检查是否为对象(新格式)或字符串(旧格式)
  const babyId = typeof data === 'object' ? data.babyId : data;
  const source = typeof data === 'object' ? (data.source || 'unknown') : 'unknown';
  
  // 避免自己触发的事件导致循环
  if (source === '当前页面标识') {
    console.log('[当前页面标识] 忽略自己触发的宝宝变更事件');
    return;
  }
  
  // 只有当ID变化时才更新
  if (currentBabyId.value !== babyId) {
    console.log(`[当前页面标识] 接收到来自[${source}]的宝宝变更事件: ${babyId}`);
    currentBabyId.value = babyId;
    
    // 强制刷新处理
    loadBabies();
    updatePoints();
    loadTaskRecords(); // 如果适用
    
    // 延迟确认
    setTimeout(() => {
      console.log('[当前页面标识] 完成宝宝变更响应');
    }, 200);
  }
});
```

### 状态检查机制

为确保页面加载或显示时的数据一致性，每个页面都应实现状态检查函数：

```js
// 宝宝状态检查函数
const checkBabyStatus = () => {
  // 从存储中读取当前宝宝ID
  const storedBabyId = uni.getStorageSync('currentBabyId');
  
  // 如果本地状态与存储不一致，更新本地状态
  if (currentBabyId.value !== storedBabyId && storedBabyId) {
    console.log(`[当前页面标识] 检测到宝宝状态不一致，从存储同步: ${storedBabyId}`);
    currentBabyId.value = storedBabyId;
    loadBabies();
    updatePoints(storedBabyId);
    // 其他必要的刷新...
  }
};

// 页面显示时检查状态
onShow(() => {
  // 每次页面显示时检查宝宝状态
  checkBabyStatus();
});
```

## 生命周期管理

每个页面必须在 `onUnmounted` 中移除事件监听器：

```js
onUnmounted(() => {
  uni.$off('babyChanged');
  // 移除其他事件监听...
});
```

## 注意事项

1. **避免循环触发**：通过 `source` 字段标识事件来源，避免事件循环触发。

2. **条件更新**：只有当新的宝宝ID与当前页面的宝宝ID不同时，才进行数据更新操作。

3. **事件延迟触发**：使用 `setTimeout` 延迟事件触发，确保状态已更新且能在下一个事件循环中正确处理。

4. **状态检查**：页面加载和显示时执行状态检查，确保与全局存储状态一致。

5. **用户反馈**：每次切换宝宝后显示toast提示，提高用户体验。

## 调试信息

所有宝宝切换相关操作都添加了详细的调试日志，使用统一的格式：

```
[页面标识] 切换宝宝: 从[oldBabyId]到[newBabyId]
[页面标识] 接收到来自[source]的宝宝变更事件: babyId
[页面标识] 完成宝宝变更响应
[页面标识] 检测到宝宝状态不一致，从存储同步: storedBabyId
``` 