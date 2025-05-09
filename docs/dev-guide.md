# 开发指南

## 目录

- [代码规范](#代码规范)
- [开发流程](#开发流程)
- [项目结构](#项目结构)
- [组件开发](#组件开发)
- [页面导航](#页面导航)
- [状态管理](#状态管理)
- [样式指南](#样式指南)
- [常见问题](#常见问题)
- [暗色模式开发指南](#暗色模式开发指南)

## 代码规范

### 命名规范

- **文件夹命名**: 全部小写，多单词使用连字符（kebab-case），如 `user-profile`
- **Vue组件命名**: 使用PascalCase，如 `UserProfile.vue`
- **JS文件命名**: 使用camelCase，如 `userService.js`
- **CSS类命名**: 使用kebab-case，如 `.user-avatar`

### 变量命名

- **常量**: 全大写加下划线，如 `MAX_COUNT`
- **变量**: 使用camelCase，如 `firstName`
- **私有变量**: 前缀加下划线，如 `_privateVar`
- **布尔值**: 前缀使用 `is`、`has`、`can` 等，如 `isActive`

### 代码格式

- 使用2个空格进行缩进
- 语句末尾使用分号
- 字符串使用单引号
- 每行最大长度80个字符
- 花括号前后各一个空格
- 运算符前后各一个空格

## 开发流程

1. **任务领取**
   - 在项目管理工具中认领任务
   - 了解需求和交付标准

2. **分支管理**
   - 从 `develop` 分支创建新功能分支
   - 命名规范: `feature/功能名称`

3. **代码开发**
   - 遵循代码规范
   - 编写单元测试
   - 确保代码可运行

4. **提交代码**
   - 提交前进行代码格式化
   - 遵循提交信息规范: `类型(范围): 描述`
   - 例如: `feat(login): 添加记住密码功能`

5. **代码审查**
   - 发起合并请求到 `develop` 分支
   - 等待代码审查并解决反馈问题

6. **测试与部署**
   - 在测试环境进行功能测试
   - 确认无问题后合并到主分支

## 项目结构

```
src/
├── api/              # API请求封装
├── assets/           # 静态资源
├── components/       # 通用组件
├── pages/            # 页面组件
├── store/            # 状态管理
├── utils/            # 工具函数
├── App.vue           # 根组件
└── main.js           # 入口文件
```

## 组件开发

### 组件结构

```vue
<template>
  <!-- 模板结构 -->
</template>

<script>
// 导入依赖
import { ref, computed, onMounted } from 'vue';

export default {
  // 组件选项
  name: 'ComponentName',
  props: {
    // 属性定义
  },
  setup(props, { emit }) {
    // 组合式API代码
    
    // 返回模板使用的数据和方法
    return {
      // ...
    };
  }
};
</script>

<style>
/* 组件样式 */
</style>
```

### 组件最佳实践

- 组件应该是自包含的，不依赖于外部状态
- props应该有类型和默认值定义
- 使用事件通知父组件状态变化
- 避免在组件中直接修改props
- 复杂计算逻辑使用computed属性

## 页面导航

### 导航方法

uni-app提供了以下几种页面导航方法：

- **uni.navigateTo()**: 保留当前页面，跳转到应用内的某个页面
- **uni.redirectTo()**: 关闭当前页面，跳转到应用内的某个页面
- **uni.navigateBack()**: 关闭当前页面，返回上一页面或多级页面
- **uni.switchTab()**: 跳转到 tabBar 页面，并关闭其他所有非 tabBar 页面
- **uni.reLaunch()**: 关闭所有页面，打开到应用内的某个页面

### 多平台路径适配

在uni-app中，不同平台对导航路径有不同的要求：

- **小程序环境**: 使用绝对路径，例如: `/pages/login/login`
- **H5环境**: 建议使用相对路径，例如从 login 页面跳转到 register 页面使用 `./register/register`，反之使用 `../login/login`
- **App环境**: 一般绝对路径和相对路径都支持

```javascript
// 使用条件编译实现多平台路径适配
let targetUrl = '';

// #ifdef H5
// H5环境使用相对路径
targetUrl = '../other/other';
// #endif

// #ifndef H5
// 非H5环境使用绝对路径
targetUrl = '/pages/other/other';
// #endif

uni.navigateTo({
  url: targetUrl
});
```

### 导航最佳实践

- 使用条件编译区分不同平台的路径格式
- 始终添加错误处理和备用导航方案
- 避免在H5环境使用绝对路径，可能导致导航失败
- 提供用户友好的导航失败提示
- 对用户交互的反馈，如loading状态和结果提示
- 实现导航守卫，控制页面访问权限

### 示例代码

```javascript
// 页面跳转示例(跨平台兼容版本)
try {
  // 检查当前运行环境
  let isH5 = false;
  // #ifdef H5
  isH5 = true;
  // #endif
  
  // 根据环境选择合适的路径格式
  const url = isH5 ? '../detail/detail' : '/pages/detail/detail';
  
  uni.navigateTo({
    url: url + '?id=1',
    success: function() {
      console.log('导航成功');
    },
    fail: function(err) {
      console.error('导航失败', err);
      // 尝试备用导航方式
      try {
        uni.redirectTo({
          url: '/pages/detail/detail?id=1'
        });
      } catch(e) {
        uni.showToast({
          title: '页面跳转失败',
          icon: 'none'
        });
      }
    }
  });
} catch (error) {
  console.error('跳转出错:', error);
  // 错误处理
}
```

### 常见导航错误

| 错误信息 | 可能的原因 | 解决方案 |
|---------|-----------|---------|
| Cannot read properties of undefined (reading 'push') | H5环境下使用了绝对路径 | 使用相对路径或条件编译区分环境 |
| navigateTo:fail page "xxx" is not found | 页面路径错误或页面不存在 | 检查pages.json中的配置和路径拼写 |
| navigateTo:fail can not navigateTo a tabbar page | 尝试使用navigateTo跳转到tabBar页面 | 使用switchTab方法 |
| navigateTo:fail webview count limit exceed | 页面层级超过限制(小程序限制10层) | 使用redirectTo或navigateBack减少层级 |

## 状态管理

本项目使用Vuex作为状态管理工具。

### 模块结构

```
store/
├── index.js          # 根Store
├── modules/          # 模块化Store
│   ├── user.js       # 用户相关状态
│   └── app.js        # 应用全局状态
└── types.js          # Mutation类型常量
```

### 状态管理最佳实践

- 将状态按领域分成不同模块
- 使用常量定义mutation类型
- 异步操作放在actions中处理
- 使用getters派生计算状态
- 避免在组件中直接修改state

## 功能模块开发指南

### 任务管理功能

任务管理是本应用的核心功能之一，包括任务创建、展示、排序、打卡和删除等功能。

#### 任务数据结构

任务的数据结构设计如下：
```javascript
{
  title: String,         // 任务名称
  completed: Number,     // 已完成时间（分钟）
  total: Number,         // 总共需要时间（分钟）
  isCompleted: Boolean,  // 是否已完成
  tags: Array,           // 任务标签，如['专注力', '学习能力']
  createdAt: Date        // 创建时间
}
```

#### 任务标签系统

任务标签系统用于对任务进行分类，有助于用户识别不同类型的任务。

1. **标签数据**:
   预设常用标签列表：
   ```javascript
   availableTags: ['专注力', '财商', '学习能力', '社交能力', '创造力', '自律能力', '体育锻炼']
   ```

2. **标签选择器**:
   实现下拉式标签选择器，支持多选：
   ```html
   <view class="tag-dropdown" @tap="toggleTagDropdown">
     <!-- 已选标签显示区域 -->
     <view class="selected-tags">
       <view v-if="newTask.tags.length === 0" class="placeholder">请选择标签</view>
       <view 
         v-for="(tag, idx) in newTask.tags" 
         :key="idx" 
         class="selected-tag"
         :class="`tag-${getTagColorClass(tag)}`"
       >
         {{ tag }}
       </view>
     </view>
     <!-- 下拉图标 -->
     <view class="dropdown-icon" :class="{ 'dropdown-icon-up': showTagDropdown }">
       <text class="iconfont icon-down">▼</text>
     </view>
   </view>
   
   <!-- 下拉菜单 -->
   <view class="tag-dropdown-menu" v-if="showTagDropdown">
     <view 
       v-for="(tag, index) in availableTags" 
       :key="index"
       class="tag-dropdown-item"
       :class="{ selected: isTagSelected(tag) }"
       @tap.stop="toggleTag(tag)"
     >
       <view class="tag-checkbox">
         <view class="checkbox-inner" v-if="isTagSelected(tag)"></view>
       </view>
       <view class="tag-name">{{ tag }}</view>
       <view 
         class="tag-color-indicator"
         :class="`tag-${getTagColorClass(tag)}`"
       ></view>
     </view>
   </view>
   ```

3. **标签选择器样式**:
   ```css
   /* 标签下拉选择器 */
   .tag-dropdown {
     background-color: #f5f5f5;
     height: 80rpx;
     border-radius: 8rpx;
     padding: 0 20rpx;
     display: flex;
     align-items: center;
     justify-content: space-between;
     position: relative;
   }
   
   .selected-tags {
     flex: 1;
     display: flex;
     flex-wrap: wrap;
     min-height: 60rpx;
     align-items: center;
     overflow: hidden;
   }
   
   .selected-tag {
     font-size: 24rpx;
     padding: 4rpx 12rpx;
     border-radius: 20rpx;
     margin-right: 10rpx;
     color: #fff;
     display: inline-block;
   }
   
   .tag-dropdown-menu {
     position: absolute;
     top: 100%;
     left: 0;
     right: 0;
     max-height: 400rpx;
     overflow-y: auto;
     background-color: #fff;
     box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
     z-index: 12;
   }
   
   .tag-dropdown-item {
     padding: 20rpx;
     display: flex;
     align-items: center;
   }
   
   .tag-checkbox {
     width: 36rpx;
     height: 36rpx;
     border-radius: 6rpx;
     border: 2rpx solid #ddd;
     display: flex;
     align-items: center;
     justify-content: center;
     margin-right: 16rpx;
   }
   ```

4. **标签管理方法**:
   ```javascript
   // 检查标签是否被选中
   isTagSelected(tag) {
     return this.newTask.tags.includes(tag);
   },
   
   // 切换标签选择状态
   toggleTag(tag) {
     const index = this.newTask.tags.indexOf(tag);
     if (index === -1) {
       // 添加标签
       this.newTask.tags.push(tag);
     } else {
       // 删除标签
       this.newTask.tags.splice(index, 1);
     }
   },
   
   // 切换下拉菜单显示状态
   toggleTagDropdown() {
     this.showTagDropdown = !this.showTagDropdown;
   },
   
   // 根据标签获取对应的颜色类名
   getTagColorClass(tag) {
     const colorMap = {
       '专注力': 'focus',
       '财商': 'finance',
       '学习能力': 'study',
       '社交能力': 'social',
       '创造力': 'creative',
       '自律能力': 'discipline',
       '体育锻炼': 'sports'
     };
     return colorMap[tag] || 'default';
   }
   ```

5. **使用注意事项**:
   - 当模态框关闭时，需要同时关闭标签下拉菜单
   - 为防止点击冒泡导致意外关闭，标签选项使用 `@tap.stop` 阻止事件传播
   - 可以设置模态框的 `max-height` 和 `overflow-y: auto` 以确保在标签较多时可以滚动查看
   - 使用视觉指示器（如颜色块）帮助用户快速识别标签类型
   - 已选标签应直接展示在选择框内，提供直观的视觉反馈

#### 任务排序逻辑

实现了根据任务状态和创建时间的智能排序，优化用户体验：

1. **排序规则**:
   - 未完成的任务优先显示在前面
   - 同为未完成的任务，按创建时间降序排列（新任务在前）
   - 已完成的任务显示在最后

2. **实现方式**:
   使用计算属性对任务列表进行排序：
   ```javascript
   computed: {
     // 按未完成优先，创建时间降序排列的任务列表
     sortedTaskList() {
       return [...this.taskList].sort((a, b) => {
         // 首先按照完成状态排序（未完成在前）
         if (a.isCompleted !== b.isCompleted) {
           return a.isCompleted ? 1 : -1;
         }
         
         // 如果完成状态相同，则按照创建时间降序排序（新任务在前）
         return new Date(b.createdAt) - new Date(a.createdAt);
       });
     }
   }
   ```

3. **使用排序后的列表**:
   在模板中使用计算属性而非原始数组：
   ```html
   <view 
     class="task-card" 
     v-for="(task, index) in sortedTaskList" 
     :key="index"
   >
     <!-- 任务内容 -->
   </view>
   ```

#### 任务删除功能

实现任务删除功能，支持用户移除不需要的任务：

1. **删除按钮**:
   ```html
   <view class="delete-btn" @tap.stop="confirmDelete(index)">×</view>
   ```

2. **确认对话框**:
   ```html
   <view class="modal-mask" v-if="showDeleteModal" @tap="cancelDelete"></view>
   <view class="delete-modal" v-if="showDeleteModal">
     <view class="delete-modal-title">确认删除</view>
     <view class="delete-modal-content">
       确定要删除任务"{{ taskToDelete ? taskToDelete.title : '' }}"吗？
     </view>
     <view class="modal-buttons">
       <button class="modal-btn modal-cancel" @tap="cancelDelete">取消</button>
       <button class="modal-btn modal-delete" @tap="deleteTask">删除</button>
     </view>
   </view>
   ```

3. **删除逻辑**:
   ```javascript
   // 确认删除任务
   confirmDelete(index) {
     const task = this.sortedTaskList[index];
     // 找到原始数组中的索引
     const originalIndex = this.taskList.findIndex(t => 
       t.title === task.title && 
       t.createdAt.getTime() === task.createdAt.getTime()
     );
     
     if (originalIndex !== -1) {
       this.taskToDelete = this.taskList[originalIndex];
       this.deleteIndex = originalIndex;
       this.showDeleteModal = true;
     }
   },
   
   // 执行删除操作
   deleteTask() {
     if (this.deleteIndex !== -1) {
       // 从数组中删除任务
       this.taskList.splice(this.deleteIndex, 1);
       
       // 保存到本地存储
       uni.setStorageSync('taskList', this.taskList);
       
       // 显示删除成功提示
       uni.showToast({
         title: '任务已删除',
         icon: 'success'
       });
       
       // 关闭删除确认弹窗
       this.cancelDelete();
     }
   }
   ```

#### 数据持久化存储

实现任务数据的本地存储，确保应用重启后能恢复任务列表：

1. **保存数据**:
   ```javascript
   // 添加/修改任务后保存
   uni.setStorageSync('taskList', this.taskList);
   ```

2. **加载数据**:
   ```javascript
   onLoad() {
     // 加载保存的任务列表
     const savedTasks = uni.getStorageSync('taskList');
     if (savedTasks && savedTasks.length > 0) {
       // 确保日期对象正确还原
       this.taskList = savedTasks.map(task => {
         return {
           ...task,
           createdAt: task.createdAt ? new Date(task.createdAt) : new Date()
         };
       });
     }
   }
   ```

3. **日期处理**:
   注意JSON序列化会将Date对象转为字符串，需要在读取时转回Date对象，否则排序等功能可能出现问题。

### 积分商城开发

积分商城是本应用中的核心功能之一，用于提高用户参与度和活跃度。

#### 数据结构

商品数据结构设计：
```javascript
{
  id: String,        // 商品唯一ID
  name: String,      // 商品名称
  icon: String,      // 商品图标（支持本地路径或Base64）
  points: Number,    // 兑换所需积分
  stock: Number,     // 库存数量
  description: String // 商品描述
}
```

#### 状态管理

积分商城相关状态推荐在Vuex中进行管理：

```javascript
// store/modules/shop.js
export default {
  state: {
    products: [],
    userPoints: 0
  },
  mutations: {
    SET_PRODUCTS(state, products) {
      state.products = products;
    },
    SET_USER_POINTS(state, points) {
      state.userPoints = points;
    },
    UPDATE_PRODUCT_STOCK(state, { productId, newStock }) {
      const product = state.products.find(p => p.id === productId);
      if (product) {
        product.stock = newStock;
      }
    }
  },
  actions: {
    // 加载商品数据
    loadProducts({ commit }) {
      // 实际开发中应从API获取
      const products = [/* 商品数据 */];
      commit('SET_PRODUCTS', products);
    },
    // 兑换商品
    exchangeProduct({ commit, state }, productId) {
      const product = state.products.find(p => p.id === productId);
      if (!product) return Promise.reject('商品不存在');
      if (product.stock <= 0) return Promise.reject('商品库存不足');
      if (state.userPoints < product.points) return Promise.reject('积分不足');
      
      // 更新积分和库存
      commit('SET_USER_POINTS', state.userPoints - product.points);
      commit('UPDATE_PRODUCT_STOCK', { 
        productId, 
        newStock: product.stock - 1 
      });
      
      return Promise.resolve('兑换成功');
    }
  }
};
```

#### 用户积分管理

积分系统与任务系统关联，完成任务可获得积分：

```javascript
// 任务完成后更新积分示例
function completeTask(taskId, taskPoints) {
  // 1. 更新任务状态为已完成
  
  // 2. 增加用户积分
  const currentPoints = getUserPoints(); // 获取当前积分
  const newPoints = currentPoints + taskPoints;
  updateUserPoints(newPoints); // 更新积分
  
  // 3. 显示积分获取提示
  uni.showToast({
    title: `恭喜获得${taskPoints}积分`,
    icon: 'none'
  });
}
```

#### 搜索功能实现

商品搜索功能实现示例：

```javascript
// 计算属性实现实时搜索过滤
computed: {
  filteredProducts() {
    if (!this.searchKeyword) return this.products;
    const keyword = this.searchKeyword.toLowerCase();
    return this.products.filter(product => 
      product.name.toLowerCase().includes(keyword) || 
      product.description.toLowerCase().includes(keyword)
    );
  }
}
```

#### UI布局最佳实践

积分商城页面布局建议：

1. 顶部：显示用户当前积分和搜索框
2. 中部：商品列表，建议使用卡片布局，保持以下设计原则：
   - 使用白色卡片搭配柔和阴影，增强层次感和立体效果
   - 库存信息以角标形式展示，更加直观
   - 积分值使用特殊标签样式，突出显示
   - 按钮添加悬浮效果和点击反馈，增强交互体验
   - 保持适当的留白和间距，避免视觉拥挤
   - 使用一致的圆角和字体大小，保持设计统一性
3. 底部：导航栏，确保与应用其他页面保持一致
4. 右下角：悬浮添加按钮（管理员功能）

商品卡片设计示例：
```css
.product-card {
  background-color: #ffffff;
  border-radius: 24rpx;
  margin-bottom: 30rpx;
  padding: 24rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 6rpx 16rpx rgba(0, 0, 0, 0.06);
  position: relative;
  transition: transform 0.2s, box-shadow 0.2s;
}

.product-card:active {
  transform: scale(0.98);
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}
```

#### 商品管理功能

##### 商品添加功能

实现商品添加功能需遵循以下步骤：

1. **创建添加商品模态框**
   ```vue
   <!-- 添加商品模态框 -->
   <view class="modal-overlay" v-if="showModal" @tap="cancelAddProduct"></view>
   <view class="modal-container" v-if="showModal">
     <view class="modal-content">
       <!-- 表单内容 -->
     </view>
   </view>
   ```

2. **表单验证**
   ```javascript
   // 添加新商品
   addProduct() {
     // 验证必填字段
     if (!this.newProduct.name) {
       uni.showToast({
         title: '商品名称不能为空',
         icon: 'none'
       });
       return;
     }
     
     // 验证积分是否为有效数字
     if (!this.newProduct.points || isNaN(Number(this.newProduct.points))) {
       uni.showToast({
         title: '请输入有效的积分数值',
         icon: 'none'
       });
       return;
     }
     
     // 其他验证...
     
     // 创建并保存商品
   }
   ```

3. **数据持久化**
   ```javascript
   // 保存商品数据到本地存储
   uni.setStorageSync('shopProducts', this.products);
   ```

4. **加载保存的数据**
   ```javascript
   onLoad() {
     // 读取已保存的商品列表
     const savedProducts = uni.getStorageSync('shopProducts');
     if (savedProducts && savedProducts.length > 0) {
       this.products = savedProducts;
     }
   }
   ```

##### 商品删除功能

1. **添加删除确认**
   ```javascript
   // 确认删除商品
   confirmDelete(index) {
     const product = this.filteredProducts[index];
     
     uni.showModal({
       title: '确认删除',
       content: `确定要删除商品"${product.name}"吗？`,
       success: (res) => {
         if (res.confirm) {
           this.deleteProduct(index);
         }
       }
     });
   }
   ```

2. **执行删除操作**
   ```javascript
   // 删除商品
   deleteProduct(index) {
     const product = this.filteredProducts[index];
     
     // 找到原始数组中的索引
     const originalIndex = this.products.findIndex(
       item => item.name === product.name && item.icon === product.icon
     );
     
     if (originalIndex !== -1) {
       // 从数组中删除
       this.products.splice(originalIndex, 1);
       
       // 保存到本地存储
       uni.setStorageSync('shopProducts', this.products);
       
       // 提示删除成功
       uni.showToast({
         title: '商品已删除',
         icon: 'success'
       });
     }
   }
   ```

##### 图标选择器

为了提供更好的用户体验，可以实现图标选择器让用户选择商品图标：

```vue
<view class="form-item">
  <text class="form-label">图标:</text>
  <view class="icon-picker">
    <view 
      v-for="(icon, i) in availableIcons" 
      :key="i" 
      :class="['icon-option', newProduct.icon === icon ? 'selected' : '']"
      @tap="selectIcon(icon)"
    >{{icon}}</view>
  </view>
</view>
```

```javascript
// 选择图标
selectIcon(icon) {
  this.newProduct.icon = icon;
}
```

#### 兑换流程

商品兑换流程建议如下：

1. 用户点击商品卡片上的"兑换"按钮
2. 系统检查用户积分是否足够
3. 检查商品库存是否充足
4. 弹出确认对话框，确认用户是否兑换
5. 用户确认后，扣减积分并减少库存
6. 显示兑换成功提示
7. 可选：记录兑换历史

## 样式指南

### CSS命名规范

本项目采用BEM命名规范：

- Block: 块，如 `.card`
- Element: 元素，如 `.card__title`
- Modifier: 修饰符，如 `.card--large`

### 样式最佳实践

- 使用SCSS预处理器
- 使用变量管理颜色和尺寸
- 避免使用!important
- 组件样式应当是独立的
- 使用媒体查询确保响应式设计
- 在微信小程序中优先使用rpx单位实现响应式

### 主题颜色规范

项目使用以下主题颜色：
- 主题色: `#8477fa` (紫色)
- 背景色: `#ffffff` (白色)
- 文本主色: `#333333` (深灰)
- 文本次要色: `#666666` (灰色)
- 边框色: `#f0f0f0` (浅灰)
- 输入框背景: `#f9f9f9` (超浅灰)
- 成功状态: `#07c160` (绿色)
- In表单背景: `#ffffff` (白色)

## 常见问题

### 1. 开发环境启动失败

**问题**: 运行`npm run dev`命令后无法启动开发服务器

**解决方案**:
- 检查Node.js版本是否符合要求
- 删除node_modules目录并重新安装依赖
- 检查端口是否被占用，可尝试更改端口

### 2. 微信登录回调问题

**问题**: 微信登录后无法正确返回应用

**解决方案**:
- 确保在小程序后台正确配置了回调域名
- 检查回调URL格式是否正确
- 参考微信开发文档进行排查

### 3. 页面导航失败问题

**问题**: 页面间导航出现TypeError或无法正确跳转

**解决方案**:
- 检查pages.json中是否正确配置了目标页面
- 确保使用绝对路径格式 (如: '/pages/login/login')
- 添加try-catch错误处理和导航失败回调
- 检查控制台错误信息，排查具体原因

### 4. 样式适配问题

**问题**: 页面在不同设备上显示异常

**解决方案**:
- 使用rpx作为尺寸单位以适应不同屏幕
- 避免使用固定像素值设置宽高
- 使用flex布局实现自适应
- 在不同尺寸设备上测试页面效果 

## 暗色模式开发指南

暗色模式是提升用户体验的重要功能，本项目实现了完整的暗色模式支持。以下是开发暗色模式相关功能的指南和最佳实践。

### 暗色模式架构

本项目使用集中式管理的暗色模式架构，主要组件包括：

1. **主题工具类**：`src/utils/themeUtils.js`，负责管理全局主题状态
2. **条件类名**：各页面通过`:class`绑定动态添加`.dark-mode`类
3. **CSS变量**：使用CSS变量定义主题颜色，便于全局切换

### 主题工具类API

`themeUtils.js`提供以下API：

```javascript
// 判断当前是否为暗色主题
import { isDarkTheme } from '@/utils/themeUtils.js';
const isDark = isDarkTheme();

// 切换主题模式
import { toggleTheme } from '@/utils/themeUtils.js';
const newMode = toggleTheme(); // 返回切换后的状态

// 设置为暗色主题
import { setDarkTheme } from '@/utils/themeUtils.js';
setDarkTheme();

// 设置为亮色主题
import { setLightTheme } from '@/utils/themeUtils.js';
setLightTheme();
```

### 在页面中实现暗色模式

1. **导入主题工具类**

```javascript
// 在<script>部分
import { isDarkTheme } from '@/utils/themeUtils.js';

export default {
  data() {
    return {
      isDarkMode: false
    }
  },
  onLoad() {
    // 初始化时获取当前主题状态
    this.isDarkMode = isDarkTheme();
  },
  onShow() {
    // 每次显示页面时更新主题状态
    this.isDarkMode = isDarkTheme();
  }
}
```

2. **添加条件类名**

在模板中使用条件类绑定暗色模式：

```html
<template>
  <view class="container" :class="{'dark-mode': isDarkMode}">
    <!-- 子元素同样可以使用条件类 -->
    <view class="card" :class="{'dark-mode': isDarkMode}">
      <!-- 内容 -->
    </view>
  </view>
</template>
```

3. **添加暗色模式CSS样式**

```css
/* 页面背景 */
.container {
  background-color: #ffffff;
  color: #333333;
}
.container.dark-mode {
  background-color: #121212;
  color: #e0e0e0;
}

/* 卡片样式 */
.card {
  background-color: #ffffff;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}
.card.dark-mode {
  background-color: #1f1f1f;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.3);
}
```

### 暗色模式设计规范

为保持应用在暗色模式下的视觉一致性，请遵循以下设计规范：

1. **背景颜色**
   - 页面背景：`#121212`
   - 卡片背景：`#1f1f1f`
   - 表单控件：`#2a2a2a`
   - 分隔线：`#333333`

2. **文本颜色**
   - 主要文本：`#e0e0e0`
   - 次要文本：`#aaaaaa` 或 `#777777`
   - 提示文本：`#666666`

3. **主题色**
   - 主紫色：`#9f8eff`（比亮色模式略微淡一些，减少视觉刺激）
   - 暗紫色：`#5e52c9`（用于深色背景上的紫色元素）

4. **阴影效果**
   - 减小不透明度：`rgba(0, 0, 0, 0.3)`
   - 减少模糊半径，增强边缘对比度

### 表单控件暗色样式

表单控件在暗色模式下的样式调整：

```css
/* 输入框 */
.input {
  background-color: #ffffff;
  border: 1rpx solid #dddddd;
  color: #333333;
}
.input.dark-mode {
  background-color: #2a2a2a;
  border: 1rpx solid #444444;
  color: #e0e0e0;
}

/* 按钮 */
.button {
  background-color: #8477fa;
  color: white;
}
.button.dark-mode {
  background-color: #9f8eff;
  color: white;
}

/* 复选框 */
.checkbox {
  border: 1rpx solid #cccccc;
}
.checkbox.dark-mode {
  border: 1rpx solid #555555;
  background-color: #2a2a2a;
}
```

### 模态框暗色样式

模态框在暗色模式下的样式调整：

```css
.modal-content {
  background-color: white;
  border-radius: 20rpx;
}
.modal-content.dark-mode {
  background-color: #1f1f1f;
}

.modal-header {
  border-bottom: 1rpx solid #eeeeee;
}
.modal-header.dark-mode {
  border-bottom: 1rpx solid #333333;
}

.modal-title {
  color: #333333;
}
.modal-title.dark-mode {
  color: #e0e0e0;
}
```

### 测试暗色模式

开发新页面或组件时，请务必在亮色和暗色两种模式下测试，确保：

1. 所有文本在两种模式下都有足够的对比度和可读性
2. 表单控件在暗色模式下清晰可用
3. 颜色和视觉层次在两种模式下保持一致
4. 切换主题时的过渡体验平滑，无闪烁或空白

### 常见问题解决

1. **暗色模式下文字对比度不足**
   - 确保文字颜色为`#e0e0e0`或更亮，提高与背景的对比
   - 可以为文字添加微弱阴影增强可读性

2. **部分元素未应用暗色样式**
   - 检查是否所有父容器都正确应用了条件类
   - 确保子元素的样式没有被更具体的选择器覆盖

3. **切换主题后页面闪烁**
   - 考虑添加CSS过渡效果：`transition: background-color 0.3s, color 0.3s;`
   - 确保所有颜色属性都有对应的暗色模式样式

## 商品详情页面

商品详情页面实现了从商品列表到商品详情的导航功能，并支持用户查看商品详细信息和进行商品兑换操作。

### 页面功能

- 展示商品详细信息（名称、积分、库存、描述等）
- 提供商品兑换功能，支持用户确认兑换
- 支持库存管理，兑换后自动更新库存数量
- 完整的用户积分操作，包括检查积分是否足够和扣除积分

### 数据传递方式

商品详情页使用本地存储（uni.setStorageSync/uni.getStorageSync）来传递数据：

```javascript
// 在商品列表页中
viewProductDetail(product, index) {
  // 将商品信息存储到本地缓存，以便详情页获取
  uni.setStorageSync('currentProduct', {
    ...product,
    index: index
  });
  
  // 跳转到商品详情页
  uni.navigateTo({
    url: '/pages/shop/product-detail'
  });
}

// 在商品详情页中
onLoad() {
  // 从本地存储获取商品信息
  const productData = uni.getStorageSync('currentProduct');
  if (productData) {
    this.product = productData;
  }
}
```

### 商品兑换流程

1. 用户点击"立即兑换"按钮
2. 系统检查用户积分是否足够
3. 系统检查商品库存是否足够
4. 显示确认兑换对话框
5. 用户确认后，扣除积分并更新库存
6. 保存更新后的数据到本地存储
7. 显示兑换成功提示
8. 延迟返回商品列表页面

### 暗黑模式支持

商品详情页完全支持暗黑模式，会根据用户设置自动切换显示样式。暗黑模式通过在页面加载和显示时读取主题设置来实现：

```javascript
import { isDarkTheme } from '@/utils/themeUtils.js';

// 在onLoad和onShow中更新主题状态
onLoad() {
  this.isDarkMode = isDarkTheme();
}

onShow() {
  this.isDarkMode = isDarkTheme();
}
```

## 路径格式
