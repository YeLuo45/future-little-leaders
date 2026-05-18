# Open Platform API Reference

**Version:** 1.0.0  
**Date:** 2026-05-19  
**SDK Version:** V42

## Overview

开放平台API参考文档。Little Leaders Open Platform允许第三方开发者构建与Little Leaders平台集成的应用程序。

## Base URLs

| Environment | API Base URL | Auth URL |
|-------------|--------------|----------|
| Production | `https://api.littleleaders.com/v1` | `https://auth.littleleaders.com/oauth` |
| Development | `https://dev-api.littleleaders.com/v1` | `https://dev-auth.littleleaders.com/oauth` |
| Test | `https://test-api.littleleaders.com/v1` | `https://test-auth.littleleaders.com/oauth` |

---

## Authentication

### OAuth 2.0

Little Leaders API使用OAuth 2.0进行认证。

#### Authorization Code Flow

1. **获取授权URL**

```javascript
const sdk = new LittleLeadersSDK({
  clientId: 'your_client_id',
  clientSecret: 'your_client_secret',
  redirectUri: 'https://yourapp.com/callback',
  scopes: ['read', 'write']
});

const authUrl = sdk.getAuthUrl();
// Redirect user to authUrl
```

2. **处理回调**

```javascript
// 在回调页面
const code = getCodeFromUrl(); // 从URL获取code参数
const tokenData = await sdk.handleAuthCallback(code);
```

3. **静默登录**

```javascript
// 下次使用时自动恢复会话
sdk.init();
if (sdk.isAuthorized()) {
  // 已登录
}
```

#### Scopes

| Scope | Description |
|-------|-------------|
| `read` | 读取用户数据 |
| `write` | 写入用户数据 |
| `tasks:read` | 读取任务数据 |
| `tasks:write` | 创建/修改任务 |
| `points:read` | 读取积分数据 |
| `points:write` | 修改积分 |
| `family:read` | 读取家庭数据 |
| `family:write` | 修改家庭设置 |

---

## Tasks API

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tasks` | 获取任务列表 |
| GET | `/tasks/{taskId}` | 获取单个任务 |
| POST | `/tasks` | 创建任务 |
| PUT | `/tasks/{taskId}` | 更新任务 |
| DELETE | `/tasks/{taskId}` | 删除任务 |
| POST | `/tasks/{taskId}/complete` | 完成任务 |
| GET | `/tasks/{taskId}/records` | 获取任务记录 |

### Task Object

```json
{
  "id": "task_123456",
  "title": "完成数学作业",
  "description": "认真完成课后习题",
  "category": "study",
  "rewardPoints": 10,
  "status": "pending",
  "dueTime": "2026-05-20T18:00:00Z",
  "completedAt": null,
  "babyId": "baby_001",
  "familyId": "family_001",
  "createdAt": "2026-05-19T10:00:00Z",
  "updatedAt": "2026-05-19T10:00:00Z"
}
```

### Categories

- `study` - 学习
- `exercise` - 运动
- `habit` - 习惯

### Status Values

- `pending` - 待完成
- `completed` - 已完成
- `failed` - 已失败

### Example: Get Tasks

```javascript
const tasks = await sdk.tasks.list({
  status: 'pending',
  category: 'study',
  limit: 20
});
```

### Example: Complete Task

```javascript
const result = await sdk.tasks.complete('task_123456', {
  completionNote: '已完成所有习题',
  evidence: 'photo_url_or_base64'
});
```

---

## Points API

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/points/balance` | 获取积分余额 |
| GET | `/points/balance/{babyId}` | 获取指定宝宝的积分 |
| GET | `/points/history` | 获取积分变动记录 |
| POST | `/points/transfer` | 转赠积分 |
| POST | `/points/add` | 添加积分（插件专用） |

### PointsChange Object

```json
{
  "id": "pc_789",
  "amount": 10,
  "balance": 150,
  "reason": "完成任务",
  "type": "reward",
  "taskId": "task_123456",
  "createdAt": "2026-05-19T15:30:00Z"
}
```

### Types

- `reward` - 任务奖励
- `purchase` - 商城购买
- `transfer` - 转赠
- `adjustment` - 调整

### Example: Get Points History

```javascript
const history = await sdk.points.getHistory({
  startDate: '2026-05-01',
  endDate: '2026-05-31',
  limit: 50
});
```

---

## Achievements API

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/achievements` | 获取成就列表 |
| GET | `/achievements/{achievementId}` | 获取成就详情 |
| GET | `/achievements/unlocked/{babyId}` | 获取已解锁成就 |

### Achievement Object

```json
{
  "id": "ach_001",
  "name": "学习达人",
  "description": "连续7天完成学习任务",
  "icon": "🏆",
  "category": "study",
  "unlockedAt": "2026-05-15T10:00:00Z",
  "babyId": "baby_001"
}
```

### Example: Get Unlocked Achievements

```javascript
const achievements = await sdk.achievements.getUnlocked('baby_001');
```

---

## Family API

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/families/{familyId}` | 获取家庭信息 |
| GET | `/families/{familyId}/members` | 获取家庭成员 |
| POST | `/families/{familyId}/invite` | 邀请成员 |
| GET | `/families/{familyId}/leaderboard` | 获取家庭排行榜 |

### FamilyMember Object

```json
{
  "id": "member_001",
  "name": "小明",
  "role": "child",
  "avatar": "https://example.com/avatar.jpg",
  "points": 150,
  "joinedAt": "2026-01-01T00:00:00Z"
}
```

### Roles

- `parent` - 家长
- `child` - 孩子

### Example: Get Leaderboard

```javascript
const leaderboard = await sdk.family.getLeaderboard('family_001', {
  period: 'monthly',
  limit: 10
});
```

---

## WebHook Events

### Event Types

| Event | Description |
|-------|-------------|
| `task.completed` | 任务完成 |
| `points.changed` | 积分变动 |
| `achievement.unlocked` | 成就解锁 |
| `family.member.joined` | 成员加入 |
| `family.member.left` | 成员离开 |

### WebHook Event Object

```json
{
  "id": "event_abc123",
  "type": "task.completed",
  "timestamp": "2026-05-19T15:30:00Z",
  "data": {
    "taskId": "task_123456",
    "babyId": "baby_001",
    "pointsEarned": 10
  }
}
```

### Subscription

```javascript
// 订阅WebHook
await sdk.webhooks.subscribe(
  'task.completed',
  'https://your-server.com/webhook',
  'your_secret_key'
);
```

### Verifying WebHook Signatures

```javascript
const isValid = LittleLeadersSDK.verifySignature(
  payload,        // 请求体
  signature,      // X-Signature header
  secret          // 注册时使用的密钥
);
```

### Local Event Listening (Frontend)

```javascript
// 前端本地监听（不需要服务器）
sdk.webhooks.on('task.completed', (event) => {
  console.log('Task completed:', event.data);
});
```

---

## Plugin API

### Embedded Plugin API

用于嵌入式插件的数据读写接口。

```javascript
const pluginAPI = new PluginContext('your_plugin_id');

// 获取当前用户
const user = await pluginAPI.getCurrentUser();

// 获取当前宝宝
const baby = await pluginAPI.getCurrentBaby();

// 创建任务
const task = await pluginAPI.createTask({
  title: '新任务',
  category: 'habit',
  rewardPoints: 5
});

// 添加积分
await pluginAPI.addPoints(10, '奖励完成额外任务');
```

---

## Error Responses

### Error Format

```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Invalid task data",
    "details": {
      "field": "title",
      "reason": "Title is required"
    }
  }
}
```

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 429 | Rate Limited |
| 500 | Server Error |

### Error Codes

| Code | Description |
|------|-------------|
| `INVALID_REQUEST` | 请求参数无效 |
| `UNAUTHORIZED` | 未授权 |
| `FORBIDDEN` | 无权限 |
| `NOT_FOUND` | 资源不存在 |
| `RATE_LIMITED` | 请求过于频繁 |
| `INTERNAL_ERROR` | 服务器内部错误 |

---

## Rate Limiting

- 默认限制：1000请求/分钟
- 写入操作：100请求/分钟
- 超出限制返回 `429` 状态码

### Rate Limit Headers

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1624000000
```

---

## Open Data Standard

### Data Format Version

All exported data uses format: `littleleaders-open-v1`

### Export Example

```javascript
const openAPI = new OpenAPI();

const taskData = await sdk.tasks.get('task_123456');
const standardized = openAPI.exportData('Task', taskData);
```

### Output Format

```json
{
  "format": "littleleaders-open-v1",
  "type": "Task",
  "data": { ... },
  "exportedAt": "2026-05-19T15:30:00Z"
}
```

---

## Quick Start

### 1. Initialize SDK

```javascript
import { LittleLeadersSDK } from '@/sdk/littleLeadersSDK';

const sdk = new LittleLeadersSDK({
  clientId: 'your_client_id',
  clientSecret: 'your_client_secret',
  redirectUri: 'https://yourapp.com/callback'
});
```

### 2. Authenticate

```javascript
// 获取授权
const authUrl = sdk.getAuthUrl();
window.location.href = authUrl;

// 处理回调
const code = new URLSearchParams(window.location.search).get('code');
await sdk.handleAuthCallback(code);
```

### 3. Make API Calls

```javascript
// 获取任务列表
const tasks = await sdk.tasks.list();

// 完成任务
await sdk.tasks.complete('task_123');

// 获取积分
const points = await sdk.points.getBalance();
```

### 4. Subscribe to Events

```javascript
sdk.webhooks.on('task.completed', (event) => {
  console.log('Task completed!', event.data);
});
```

---

## SDK Configuration

```javascript
const sdk = new LittleLeadersSDK({
  // 必需
  clientId: 'your_client_id',
  clientSecret: 'your_client_secret',
  redirectUri: 'https://yourapp.com/callback',
  
  // 可选
  apiBaseUrl: 'https://api.littleleaders.com/v1',  // 覆盖默认API地址
  authUrl: 'https://auth.littleleaders.com/oauth', // 覆盖默认授权地址
  scopes: ['read', 'write'],
  
  // 超时配置（毫秒）
  timeout: 30000,
  
  // 重试次数
  retryAttempts: 3
});
```

---

## Changelog

### v1.0.0 (2026-05-19)

- Initial release
- OAuth 2.0 authentication
- Tasks API
- Points API
- Achievements API
- Family API
- WebHook subscriptions
- Plugin API
