# PRD-V43: 暗色模式完善

## 1. 概述

**功能**：完善暗色模式支持，确保所有页面正确应用深色主题

**问题**：当前暗色模式仅通过 `.dark-mode` class 控制，但存在以下问题：
1. App.vue 未在启动时初始化暗色模式
2. 全局样式变量未被 `data-theme` 属性驱动
3. FlowEditor 等关键页面可能未正确响应暗色切换

## 2. 解决方案

### 2.1 App.vue 启动时初始化暗色模式

```javascript
// onLaunch 中添加
initDarkMode: function() {
  const savedTheme = uni.getStorageSync('currentThemeId') || 'light'
  if (savedTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark')
    document.body.classList.add('dark-mode')
  }
}
```

### 2.2 全局 CSS 变量支持 data-theme

更新 `common.css`，让 CSS 变量同时响应 `data-theme` 属性：

```css
[data-theme="dark"] {
  --primary-color: #6b5aff;
  --bg-main: #121212;
  --bg-card: #1f1f1f;
  --text-main: #e0e0e0;
  ...
}
```

### 2.3 FlowEditor 暗色适配

FlowEditor 需要响应 dark mode：
- 画布背景色
- 节点背景色
- 连线颜色
- 工具栏背景

## 3. 验收标准

- [ ] App.vue 启动时正确恢复暗色模式
- [ ] 切换暗色模式后所有页面同步变化
- [ ] FlowEditor 画布和节点在暗色模式下正确显示
- [ ] node --check 语法验证通过
