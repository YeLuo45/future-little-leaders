# 认证系统文档

## 概述
亲子任务宝应用提供了多种认证方式，用于在完成任务和其他敏感操作时进行身份验证。目前支持的认证方式包括密码验证、指纹识别和人脸识别。本文档详细介绍了认证系统的API和使用方法。

## 存储结构

### 认证设置
```javascript
// 存储键名: 'authSettings'
{
  isEnabled: Boolean,    // 是否启用认证模式
  hasPassword: Boolean,  // 是否设置了密码
  hasBiometric: Boolean, // 是否启用了指纹识别
  hasFaceId: Boolean     // 是否启用了人脸识别
}
```

### 密码存储
```javascript
// 存储键名: 'authPassword'
// 值: 密码字符串，长度限制为6-40个字符
```

## 认证工具函数库 (v1.0.2新增)

从v1.0.2版本开始，我们提供了统一的认证工具函数库，方便在应用的各个部分实现一致的认证体验。

### 导入认证工具函数
```javascript
import { verifyAuth, isAuthModeEnabled, getAuthSettings, saveAuthSettings } from '@/utils/authUtils';
```

### 检查认证模式是否开启
```javascript
const isEnabled = isAuthModeEnabled();
if (isEnabled) {
  console.log('认证模式已开启');
} else {
  console.log('认证模式未开启');
}
```

### 获取认证设置
```javascript
const settings = getAuthSettings();
if (settings) {
  console.log('密码验证:', settings.hasPassword);
  console.log('指纹识别:', settings.hasBiometric);
  console.log('人脸识别:', settings.hasFaceId);
}
```

### 保存认证设置
```javascript
const settings = {
  isEnabled: true,
  hasPassword: true,
  hasBiometric: false,
  hasFaceId: false
};
saveAuthSettings(settings);
```

### 验证用户身份
```javascript
verifyAuth(
  // 验证成功回调
  () => {
    console.log('验证成功，执行后续操作');
    performSensitiveOperation();
  },
  // 验证失败回调
  (error) => {
    console.error('验证失败:', error);
    showErrorToast('验证失败，无法执行操作');
  }
);
```

## 使用场景

认证系统在以下场景中使用:

1. **任务完成认证**
   - 确保任务真实完成，防止孩子自行完成任务

2. **敏感操作认证** (v1.0.2新增)
   - 删除宝宝信息
   - 修改个人信息
   - 商城商品添加
   - 商品兑换

3. **设置更改认证**
   - 关闭认证模式
   - 关闭生物识别/人脸识别

## 认证流程

1. 调用`verifyAuth`函数，传入成功和失败回调
2. 如果认证模式未开启，直接调用成功回调
3. 如果认证模式已开启，显示可用认证方式列表
4. 用户选择认证方式后，进行对应的认证流程
5. 认证成功，调用成功回调；认证失败，调用失败回调
6. 如果第一种认证方式失败，将提供其他可用认证方式 (v1.0.2新增)

## 密码验证特性 (v1.0.2更新)

在v1.0.2版本中，密码验证的弹窗进行了优化：
```javascript
uni.showModal({
  title: '请输入密码',
  editable: true,
  placeholderText: '请输入密码',
  // 使用password属性确保密码显示为掩码
  content: '', 
  password: true,
  success: (res) => {
    // 验证成功处理逻辑
  }
});
```

## 认证失败后尝试其他方式 (v1.0.2新增)

当用户使用生物识别或人脸识别失败时，系统会提供其他可用的认证方式：
```javascript
function tryOtherAuthMethod(successCallback, failCallback) {
  const authSettings = getAuthSettings();
  if (authSettings && authSettings.hasPassword) {
    uni.showModal({
      title: '验证失败',
      content: '是否使用密码验证？',
      success: (res) => {
        if (res.confirm) {
          // 使用密码验证
          passwordAuth(successCallback, failCallback);
        }
      }
    });
  }
}
```

## 兼容性说明

### 密码验证
- 所有平台通用

### 指纹验证和人脸识别
- 仅微信小程序环境支持
- 需要设备硬件支持
- 指纹验证需要设备已录入指纹
- 人脸识别需要设备已录入人脸信息

## 注意事项
1. 密码长度限制为6-40个字符
2. 开启认证模式前，至少需要设置一种认证方式
3. 如果所有认证方式都被关闭，认证模式将自动关闭
4. 生物识别特性依赖于微信小程序的SOTER安全组件
5. 认证失败时，需要适当处理错误信息并给予用户反馈 