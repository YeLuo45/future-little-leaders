# API 文档索引

本目录包含应用的所有API接口文档，按功能模块组织。

## API文档列表

- [用户认证与管理](./user.md) - 包含登录、注册、找回密码等相关接口
- [任务管理](./task.md) - 包含任务的创建、更新、删除、完成等相关接口
- [积分商城](./shop.md) - 包含商品浏览、兑换、库存管理等相关接口
- [个人中心](./profile.md) - 包含用户资料、设置、操作记录等相关接口
- [社区功能](./community.md) - 包含社区主题、评论、点赞、收藏等相关接口

## API规范

所有API接口遵循以下规范：

### 请求格式

- GET请求参数通过URL Query String传递
- POST/PUT/DELETE等请求参数通过JSON格式在请求体中传递
- 文件上传使用multipart/form-data格式

### 响应格式

所有接口返回统一的JSON格式：

```json
{
  "code": 200,           // 响应状态码，200表示成功
  "message": "success",  // 状态描述信息
  "data": {              // 业务数据，根据接口不同而不同
    // ...
  }
}
```

### 错误处理

当API调用出错时，会返回相应的错误码和错误信息：

```json
{
  "code": 400,                     // 错误码
  "message": "Invalid parameter",  // 错误描述
  "data": null                     // 业务数据为空
}
```

常见错误码：

- 400: 请求参数错误
- 401: 未授权，请先登录
- 403: 权限不足，无法操作
- 404: 资源不存在
- 429: 请求频率过高
- 500: 服务器内部错误

## 认证方式

API使用基于Token的认证机制：

1. 客户端调用登录接口获取token
2. 后续请求在Header中携带token
   ```
   Authorization: Bearer {token}
   ```
3. Token有效期为7天，过期后需重新登录获取

## 版本控制

API版本通过URL路径控制，当前版本为v1：

```
/api/v1/users
```

后续版本更新时，将使用新的版本号：

```
/api/v2/users
```

## 环境说明

- 开发环境: https://dev-api.example.com
- 测试环境: https://test-api.example.com
- 生产环境: https://api.example.com 