# 育儿社区API文档

## 基础信息

- 基础URL: `http://localhost:8080/api`
- 所有需要认证的接口都需要在请求头中携带 `Authorization: Bearer <token>`
- 响应格式统一为:
```json
{
  "code": 0,      // 0表示成功，非0表示错误
  "message": "",  // 响应消息
  "data": null    // 响应数据
}
```

## 用户认证

### 1. 用户注册
- 请求方式: `POST`
- 路径: `/users/register`
- 请求体:
```json
{
  "username": "string",     // 用户名
  "password": "string",     // 密码
  "confirmPassword": "string", // 确认密码
  "code": "string"         // 验证码
}
```
- 响应示例:
```json
{
  "code": 0,
  "message": "注册成功",
  "data": {
    "id": "string",
    "username": "string"
  }
}
```

### 2. 用户登录
- 请求方式: `POST`
- 路径: `/users/login`
- 请求体:
```json
{
  "username": "string",  // 用户名
  "password": "string"   // 密码
}
```
- 响应示例:
```json
{
  "code": 0,
  "message": "登录成功",
  "data": {
    "token": "string",
    "userInfo": {
      "id": "string",
      "username": "string",
      "nickname": "string",
      "avatar": "string"
    }
  }
}
```

### 3. 忘记密码
- 请求方式: `POST`
- 路径: `/users/forget-password`
- 请求体:
```json
{
  "phone": "string",      // 手机号
  "code": "string",       // 验证码
  "newPassword": "string", // 新密码
  "confirmPassword": "string" // 确认密码
}
```

## 用户信息

### 1. 获取用户信息
- 请求方式: `GET`
- 路径: `/users/info`
- 需要认证: 是
- 响应示例:
```json
{
  "code": 0,
  "message": "获取成功",
  "data": {
    "id": "string",
    "username": "string",
    "nickname": "string",
    "avatar": "string",
    "email": "string",
    "phone": "string",
    "gender": "string",
    "birthday": "string",
    "registerDate": "string",
    "lastLoginTime": "string"
  }
}
```

### 2. 更新用户信息
- 请求方式: `PUT`
- 路径: `/users/info`
- 需要认证: 是
- 请求体:
```json
{
  "nickname": "string",
  "avatar": "string",
  "gender": "string",
  "birthday": "string",
  "email": "string",
  "phone": "string"
}
```

## 社区功能

### 1. 获取主题列表
- 请求方式: `GET`
- 路径: `/community/topics`
- 查询参数:
  - `page`: 页码（默认1）
  - `pageSize`: 每页数量（默认10）
  - `category`: 分类
  - `sort`: 排序方式（new/hot）
  - `keyword`: 搜索关键词
- 响应示例:
```json
{
  "code": 0,
  "message": "获取成功",
  "data": {
    "list": [
      {
        "id": "string",
        "title": "string",
        "content": "string",
        "author": {
          "id": "string",
          "username": "string",
          "avatar": "string"
        },
        "likes_count": 0,
        "comments_count": 0,
        "is_liked": false,
        "is_collected": false,
        "create_time": "string"
      }
    ],
    "total": 0,
    "page": 1,
    "pageSize": 10
  }
}
```

### 2. 获取主题详情
- 请求方式: `GET`
- 路径: `/community/topics/:topicId`
- 需要认证: 否（可选）
- 响应示例:
```json
{
  "code": 0,
  "message": "获取成功",
  "data": {
    "id": "string",
    "title": "string",
    "content": "string",
    "author": {
      "id": "string",
      "username": "string",
      "avatar": "string"
    },
    "likes_count": 0,
    "comments_count": 0,
    "is_liked": false,
    "is_collected": false,
    "create_time": "string",
    "comments": [
      {
        "id": "string",
        "content": "string",
        "author": {
          "id": "string",
          "username": "string",
          "avatar": "string"
        },
        "likes_count": 0,
        "is_liked": false,
        "create_time": "string"
      }
    ]
  }
}
```

### 3. 发布主题
- 请求方式: `POST`
- 路径: `/community/topics`
- 需要认证: 是
- 请求体:
```json
{
  "title": "string",
  "content": "string"
}
```

### 4. 点赞/取消点赞主题
- 请求方式: `POST`
- 路径: `/community/topics/:topicId/like` 或 `/community/topics/:topicId/unlike`
- 需要认证: 是

### 5. 收藏/取消收藏主题
- 请求方式: `POST`
- 路径: `/community/topics/:topicId/collect` 或 `/community/topics/:topicId/uncollect`
- 需要认证: 是

### 6. 发表评论
- 请求方式: `POST`
- 路径: `/community/topics/:topicId/comments`
- 需要认证: 是
- 请求体:
```json
{
  "content": "string"
}
```

### 7. 点赞/取消点赞评论
- 请求方式: `POST`
- 路径: `/community/comments/:commentId/like` 或 `/community/comments/:commentId/unlike`
- 需要认证: 是

### 8. 举报
- 请求方式: `POST`
- 路径: `/community/report`
- 需要认证: 是
- 请求体:
```json
{
  "target_id": "string",
  "target_type": "topic|comment",
  "reason": "string"
}
```

## 用户内容

### 1. 获取用户发布的主题
- 请求方式: `GET`
- 路径: `/users/topics`
- 需要认证: 是
- 查询参数:
  - `page`: 页码（默认1）
  - `pageSize`: 每页数量（默认10）

### 2. 获取用户发表的评论
- 请求方式: `GET`
- 路径: `/users/comments`
- 需要认证: 是
- 查询参数:
  - `page`: 页码（默认1）
  - `pageSize`: 每页数量（默认10）

### 3. 获取用户点赞列表
- 请求方式: `GET`
- 路径: `/users/likes`
- 需要认证: 是
- 查询参数:
  - `page`: 页码（默认1）
  - `pageSize`: 每页数量（默认10）

### 4. 获取用户收藏列表
- 请求方式: `GET`
- 路径: `/users/collections`
- 需要认证: 是
- 查询参数:
  - `page`: 页码（默认1）
  - `pageSize`: 每页数量（默认10）

## 反馈功能

### 1. 提交反馈
- 请求方式: `POST`
- 路径: `/feedback`
- 需要认证: 是
- 请求体:
```json
{
  "type": "string",
  "content": "string",
  "images": ["string"]
}
```

### 2. 获取用户反馈列表
- 请求方式: `GET`
- 路径: `/feedback`
- 需要认证: 是
- 查询参数:
  - `page`: 页码（默认1）
  - `pageSize`: 每页数量（默认10）

## 任务功能

### 1. 获取任务列表
- 请求方式: `GET`
- 路径: `/tasks`
- 需要认证: 是
- 查询参数:
  - `status`: 任务状态（ongoing-进行中、completed-已完成、all-全部）
  - `tag`: 筛选特定标签的任务
  - `page`: 页码（默认1）
  - `pageSize`: 每页数量（默认10）
  - `isRecurring`: 是否筛选周期性任务
- 响应示例:
```json
{
  "code": 0,
  "message": "获取成功",
  "data": {
    "list": [
      {
        "id": 1001,
        "title": "每日读书30分钟",
        "completed": 20,
        "total": 30,
        "isCompleted": false,
        "tags": ["学习能力"],
        "createdAt": "2023-09-03T10:00:00",
        "points": 10,
        "isRecurring": true,
        "recurringType": "daily",
        "recurringConfig": {
          "startDate": "2023-09-01",
          "endDate": null,
          "frequency": 1,
          "nextRefreshTime": "2023-09-04T00:00:00"
        }
      }
    ],
    "pagination": {
      "total": 15,
      "page": 1,
      "pageSize": 10,
      "totalPages": 2
    }
  }
}
```

### 2. 创建任务
- 请求方式: `POST`
- 路径: `/tasks`
- 需要认证: 是
- 请求体:
```json
{
  "title": "string",          // 任务标题
  "total": 45,               // 预计完成时间(分钟)
  "tags": ["学习能力"],       // 任务标签
  "points": 15,              // 任务完成奖励积分
  "isRecurring": false,      // 是否为周期性任务
  "recurringType": "daily",  // 周期类型：daily/weekly/monthly/custom
  "recurringConfig": {       // 周期配置信息（当isRecurring为true时必填）
    "startDate": "2023-10-01",  // 开始日期
    "endDate": "2023-12-31",    // 结束日期（可选）
    "frequency": 1,             // 频率
    "weekdays": [1,3,5],       // 周几（weekly类型时使用）
    "monthDays": [1,15],       // 每月几号（monthly类型时使用）
    "specificTime": "08:00"     // 指定时间点
  }
}
```

### 3. 更新任务
- 请求方式: `PUT`
- 路径: `/tasks/{taskId}`
- 需要认证: 是
- 请求体:
```json
{
  "title": "string",          // 任务标题（可选）
  "total": 60,               // 预计完成时间（可选）
  "completed": 30,           // 已完成时间（可选）
  "isCompleted": false,      // 是否已完成（可选）
  "tags": ["string"],        // 任务标签（可选）
  "points": 20,              // 任务积分（可选）
  "isRecurring": true,       // 是否为周期性任务（可选）
  "recurringType": "weekly", // 周期类型（可选）
  "recurringConfig": {}      // 周期配置（可选）
}
```

### 4. 完成任务打卡
- 请求方式: `POST`
- 路径: `/tasks/{taskId}/complete`
- 需要认证: 是
- 响应示例:
```json
{
  "code": 0,
  "message": "打卡成功",
  "data": {
    "task": {
      "id": 1003,
      "title": "完成高等数学作业",
      "completed": 60,
      "total": 60,
      "isCompleted": true,
      "tags": ["学习能力"],
      "points": 20,
      "isRecurring": true,
      "recurringConfig": {
        "nextRefreshTime": "2023-10-10T00:00:00"
      }
    },
    "pointsEarned": 20,
    "totalPoints": 300,
    "isRecurringTask": true,
    "nextRefreshInfo": {
      "nextRefreshTime": "2023-10-10T00:00:00",
      "daysUntilNextRefresh": 7
    }
  }
}
```

### 5. 删除任务
- 请求方式: `DELETE`
- 路径: `/tasks/{taskId}`
- 需要认证: 是
- 查询参数:
  - `deleteRecurring`: 对于周期性任务，是否删除整个周期配置（默认false）

### 6. 获取即将刷新的任务
- 请求方式: `GET`
- 路径: `/tasks/upcoming-refresh`
- 需要认证: 是
- 查询参数:
  - `days`: 未来几天内将刷新的任务（默认3）
  - `page`: 页码（默认1）
  - `pageSize`: 每页数量（默认10）

### 7. 获取任务刷新历史
- 请求方式: `GET`
- 路径: `/tasks/{taskId}/refresh-history`
- 需要认证: 是
- 查询参数:
  - `page`: 页码（默认1）
  - `pageSize`: 每页数量（默认10）

### 8. 获取可用标签列表
- 请求方式: `GET`
- 路径: `/tasks/tags`
- 需要认证: 是
- 响应示例:
```json
{
  "code": 0,
  "message": "获取成功",
  "data": [
    {
      "name": "专注力",
      "color": "focus"
    },
    {
      "name": "学习能力",
      "color": "study"
    },
    {
      "name": "社交能力",
      "color": "social"
    }
  ]
}
```

## 测试用例

以下是一个完整的测试用例示例，使用Node.js和axios实现：

```javascript
const axios = require('axios');

const BASE_URL = 'http://localhost:8080/api';
let token = null;
let topicId = null;
let commentId = null;
let taskId = null;

// 测试登录
async function testLogin() {
  const response = await axios.post(`${BASE_URL}/users/login`, {
    username: 'testuser',
    password: 'password123'
  });
  
  if (response.data.code === 0) {
    token = response.data.data.token;
    return true;
  }
  return false;
}

// 测试获取主题列表
async function testGetTopics() {
  const response = await axios.get(`${BASE_URL}/community/topics`);
  
  if (response.data.code === 0 && response.data.data.list.length > 0) {
    topicId = response.data.data.list[0].id;
    return true;
  }
  return false;
}

// 测试点赞主题
async function testLikeTopic() {
  const response = await axios.post(
    `${BASE_URL}/community/topics/${topicId}/like`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  
  return response.data.code === 0;
}

// 测试收藏主题
async function testCollectTopic() {
  const response = await axios.post(
    `${BASE_URL}/community/topics/${topicId}/collect`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  
  return response.data.code === 0;
}

// 测试发表评论
async function testAddComment() {
  const response = await axios.post(
    `${BASE_URL}/community/topics/${topicId}/comments`,
    {
      content: '测试评论'
    },
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  
  if (response.data.code === 0) {
    commentId = response.data.data.comment_id;
    return true;
  }
  return false;
}

// 测试点赞评论
async function testLikeComment() {
  const response = await axios.post(
    `${BASE_URL}/community/comments/${commentId}/like`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  
  return response.data.code === 0;
}

// 测试举报
async function testReport() {
  const response = await axios.post(
    `${BASE_URL}/community/report`,
    {
      target_id: topicId,
      target_type: 'topic',
      reason: 'spam'
    },
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  
  return response.data.code === 0;
}

// 任务相关测试用例
async function testCreateTask() {
  const response = await axios.post(
    `${BASE_URL}/tasks`,
    {
      title: "每日读书30分钟",
      total: 30,
      tags: ["学习能力"],
      points: 10,
      isRecurring: true,
      recurringType: "daily",
      recurringConfig: {
        startDate: "2023-10-01",
        frequency: 1,
        specificTime: "08:00"
      }
    },
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  
  if (response.data.code === 0) {
    taskId = response.data.data.id;
    return true;
  }
  return false;
}

async function testCompleteTask() {
  const response = await axios.post(
    `${BASE_URL}/tasks/${taskId}/complete`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  
  return response.data.code === 0;
}

// 运行测试
async function runTests() {
  try {
    await testLogin();
    await testGetTopics();
    await testLikeTopic();
    await testCollectTopic();
    await testAddComment();
    await testLikeComment();
    await testReport();
    await testCreateTask();
    await testCompleteTask();
    console.log('所有测试通过');
  } catch (error) {
    console.error('测试失败:', error);
  }
}

runTests();
```

## 错误码说明

- 0: 成功
- 1000: 通用错误
- 1001: 用户名或密码错误
- 1002: 用户名已注册
- 1003: 验证码错误
- 1004: 用户不存在
- 401: 未授权
- 404: 资源不存在
- 500: 服务器内部错误 