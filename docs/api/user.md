# 用户相关接口

## 登录

### 请求

```
POST /api/user/login
```

#### 参数

| 参数名   | 类型   | 必填 | 说明   |
|----------|--------|------|--------|
| username | string | 是   | 用户名 |
| password | string | 是   | 密码   |

#### 请求示例

```json
{
  "username": "user123",
  "password": "password123"
}
```

### 响应

#### 成功响应

```json
{
  "code": 0,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "userInfo": {
      "id": 1001,
      "username": "user123",
      "nickname": "测试用户",
      "avatar": "https://example.com/avatar.jpg"
    }
  }
}
```

#### 失败响应

```json
{
  "code": 1001,
  "message": "用户名或密码错误",
  "data": null
}
```

## 注册

### 请求

```
POST /api/user/register
```

#### 参数

| 参数名   | 类型   | 必填 | 说明   |
|----------|--------|------|--------|
| username | string | 是   | 手机号 |
| password | string | 是   | 密码   |
| confirmPassword | string | 是 | 确认密码 |
| code     | string | 是   | 验证码 |

#### 请求示例

```json
{
  "username": "13800138000",
  "password": "password123",
  "confirmPassword": "password123",
  "code": "123456"
}
```

### 响应

#### 成功响应

```json
{
  "code": 0,
  "message": "注册成功",
  "data": {
    "id": 1002,
    "username": "13800138000"
  }
}
```

#### 失败响应

```json
{
  "code": 1002,
  "message": "手机号已注册",
  "data": null
}
```

## 忘记密码

### 请求

```
POST /api/user/forget-password
```

#### 参数

| 参数名   | 类型   | 必填 | 说明   |
|----------|--------|------|--------|
| phone    | string | 是   | 手机号 |
| code     | string | 是   | 验证码 |
| newPassword | string | 是 | 新密码 |
| confirmPassword | string | 是 | 确认新密码 |

#### 请求示例

```json
{
  "phone": "13800138000",
  "code": "123456",
  "newPassword": "newpass123",
  "confirmPassword": "newpass123"
}
```

### 响应

#### 成功响应

```json
{
  "code": 0,
  "message": "密码重置成功",
  "data": null
}
```

#### 失败响应

```json
{
  "code": 1003,
  "message": "验证码错误",
  "data": null
}
```

## 获取用户信息

### 请求

```
GET /api/user/profile
```

#### 请求头

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 响应

#### 成功响应

```json
{
  "code": 0,
  "message": "获取成功",
  "data": {
    "id": 1001,
    "username": "user123",
    "nickname": "测试用户",
    "avatar": "https://example.com/avatar.jpg",
    "email": "user@example.com",
    "phone": "13800138000",
    "createTime": "2023-01-01 12:00:00"
  }
}
```

#### 失败响应

```json
{
  "code": 401,
  "message": "未授权或token已过期",
  "data": null
}
```

## 获取验证码

### 请求

```
POST /api/user/send-code
```

#### 参数

| 参数名   | 类型   | 必填 | 说明   |
|----------|--------|------|--------|
| phone    | string | 是   | 手机号 |
| type     | string | 是   | 验证码类型（register-注册，reset-重置密码） |

#### 请求示例

```json
{
  "phone": "13800138000",
  "type": "register"
}
```

### 响应

#### 成功响应

```json
{
  "code": 0,
  "message": "验证码已发送",
  "data": {
    "expireTime": 300 // 验证码有效期（秒）
  }
}
```

#### 失败响应

```json
{
  "code": 1004,
  "message": "发送验证码过于频繁，请稍后再试",
  "data": null
}
``` 