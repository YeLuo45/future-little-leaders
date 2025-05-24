# 添加商品功能重构方案

## 变更说明

本次变更将添加商品功能从 `shop.vue` 中分离出来，创建独立的 `add-product.vue` 页面。这样的改动可以：

1. 提高代码的可维护性和可读性
2. 遵循单一职责原则
3. 提供更好的用户体验
4. 便于后续功能扩展

## 技术方案

### 1. 文件结构

```
src/pages/shop/
├── shop.vue          # 商城主页面
├── add-product.vue   # 新增：添加商品页面
└── add-product.md    # 新增：技术方案文档
```

### 2. 功能模块

#### 2.1 添加商品页面 (add-product.vue)

- 表单输入
  - 商品名称
  - 所需积分
  - 库存数量
  - 商品描述
  - 商品图标选择
- 表单验证
- 数据持久化
- 页面导航

#### 2.2 商城主页面 (shop.vue)

- 移除原有的添加商品模态框
- 添加跳转到新页面的功能
- 添加商品列表刷新事件监听

### 3. 数据流

1. 用户点击商城页面的添加按钮
2. 跳转到添加商品页面
3. 用户填写商品信息
4. 提交表单，保存到本地存储
5. 返回商城页面并触发刷新
6. 商城页面重新加载商品列表

### 4. 事件通信

使用 uni-app 的事件通信机制：

- 触发事件：`uni.$emit('refreshProductList')`
- 监听事件：`uni.$on('refreshProductList', loadProducts)`
- 移除监听：`uni.$off('refreshProductList')`

### 5. 本地存储

使用 uni-app 的本地存储 API：

- 读取：`uni.getStorageSync('shopProducts')`
- 写入：`uni.setStorageSync('shopProducts', JSON.stringify(products))`

## 接口说明

### 1. 页面路由

```javascript
// 跳转到添加商品页面
uni.navigateTo({
  url: '/pages/shop/add-product'
});
```

### 2. 事件通信

```javascript
// 触发商品列表刷新
uni.$emit('refreshProductList');

// 监听商品列表刷新
uni.$on('refreshProductList', loadProducts);

// 移除监听
uni.$off('refreshProductList');
```

### 3. 数据结构

```javascript
// 商品对象结构
{
  name: string,        // 商品名称
  points: number,      // 所需积分
  stock: string|number,// 库存数量
  icon: string,        // 商品图标
  description: string  // 商品描述
}
```

## 迭代记录

### 2024-03-xx

1. 创建 `add-product.vue` 文件
2. 实现添加商品表单
3. 实现表单验证
4. 实现数据持久化
5. 修改 `shop.vue`，移除原有添加商品功能
6. 添加页面跳转和事件通信
7. 创建技术方案文档

### 2024-06-09

- 商品支持图片上传与图标二选一，表单和数据结构同步调整。
- 商品卡片支持图片优先展示，支持点击图片放大预览。
- 商城页面支持商品卡片1/2/3列布局切换。
- 商品详情页支持图片优先展示与放大。

### 图片上传与展示
- 商品对象增加image字段，优先展示image，无则展示icon。
- 商品图片支持点击放大（uni.previewImage）。
- 商品卡片布局通过layoutType切换1/2/3列。

## 后续优化建议

1. 添加商品图片上传功能
2. 添加商品分类功能
3. 添加商品编辑功能
4. 添加商品删除功能
5. 添加商品搜索和筛选功能
6. 优化表单验证和错误提示
7. 添加商品预览功能 