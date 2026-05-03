# 用户个人资料相关接口

## 获取用户基本信息

### 请求

```
GET /api/user/info
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
    "username": "xiaoming",
    "nickname": "小明",
    "avatar": "https://example.com/avatar/xiaoming.jpg",
    "email": "xiaoming@example.com",
    "phone": "13800138000",
    "gender": "male",
    "birthday": "2000-01-01",
    "registerDate": "2023-01-15T10:30:00",
    "lastLoginTime": "2023-09-10T15:30:00"
  }
}
```

## 更新用户信息

### 请求

```
PUT /api/user/info
```

#### 请求头

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 参数

| 参数名    | 类型    | 必填 | 说明     |
|-----------|---------|------|----------|
| nickname  | string  | 否   | 用户昵称 |
| avatar    | string  | 否   | 头像URL  |
| gender    | string  | 否   | 性别(male/female/other) |
| birthday  | string  | 否   | 生日，格式：YYYY-MM-DD |
| email     | string  | 否   | 邮箱地址 |
| phone     | string  | 否   | 手机号码 |

#### 请求示例

```json
{
  "nickname": "小明明",
  "gender": "male",
  "avatar": "https://example.com/avatar/xiaoming_new.jpg"
}
```

### 响应

#### 成功响应

```json
{
  "code": 0,
  "message": "更新成功",
  "data": {
    "id": 1001,
    "username": "xiaoming",
    "nickname": "小明明",
    "avatar": "https://example.com/avatar/xiaoming_new.jpg",
    "email": "xiaoming@example.com",
    "phone": "13800138000",
    "gender": "male",
    "birthday": "2000-01-01",
    "updateTime": "2023-09-11T09:15:00"
  }
}
```

## 修改密码

### 请求

```
PUT /api/user/password
```

#### 请求头

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 参数

| 参数名          | 类型    | 必填 | 说明     |
|-----------------|---------|------|----------|
| oldPassword     | string  | 是   | 旧密码   |
| newPassword     | string  | 是   | 新密码   |
| confirmPassword | string  | 是   | 确认新密码 |

#### 请求示例

```json
{
  "oldPassword": "oldpass123",
  "newPassword": "newpass456",
  "confirmPassword": "newpass456"
}
```

### 响应

#### 成功响应

```json
{
  "code": 0,
  "message": "密码修改成功",
  "data": null
}
```

#### 失败响应 - 旧密码错误

```json
{
  "code": 1001,
  "message": "旧密码不正确",
  "data": null
}
```

## 获取用户积分信息

### 请求

```
GET /api/user/points
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
    "totalPoints": 500,
    "availablePoints": 300,
    "usedPoints": 200,
    "statistics": {
      "taskEarned": 450,
      "otherEarned": 50,
      "shopUsed": 180,
      "otherUsed": 20
    }
  }
}
```

## 获取积分明细记录

### 请求

```
GET /api/user/points/records
```

#### 请求头

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 查询参数

| 参数名    | 类型    | 必填 | 说明                 |
|-----------|---------|------|----------------------|
| type      | string  | 否   | 记录类型：income(收入)、expense(支出)、all(全部) |
| page      | integer | 否   | 页码，默认为1        |
| pageSize  | integer | 否   | 每页数量，默认为10   |
| startDate | string  | 否   | 开始日期，格式：YYYY-MM-DD |
| endDate   | string  | 否   | 结束日期，格式：YYYY-MM-DD |

### 响应

#### 成功响应

```json
{
  "code": 0,
  "message": "获取成功",
  "data": {
    "list": [
      {
        "id": 1001,
        "type": "income",
        "points": 20,
        "source": "task",
        "description": "完成任务：每日读书30分钟",
        "createTime": "2023-09-10T15:30:00",
        "balance": 500
      },
      {
        "id": 1000,
        "type": "expense",
        "points": -100,
        "source": "shop",
        "description": "兑换商品：精美笔记本",
        "createTime": "2023-09-09T10:15:00",
        "balance": 480
      }
    ],
    "pagination": {
      "total": 20,
      "page": 1,
      "pageSize": 10,
      "totalPages": 2
    }
  }
}
```

## 获取任务统计数据

### 请求

```
GET /api/user/task-statistics
```

#### 请求头

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 查询参数

| 参数名   | 类型   | 必填 | 说明               |
|----------|--------|------|-------------------|
| period   | string | 否   | 统计周期：day(日)、week(周)、month(月)、year(年)，默认为week |

### 响应

#### 成功响应

```json
{
  "code": 0,
  "message": "获取成功",
  "data": {
    "totalTasks": 15,
    "completedTasks": 10,
    "completionRate": 66.7,
    "earnedPoints": 150,
    "averagePointsPerTask": 15,
    "topTags": [
      {
        "name": "学习能力",
        "count": 5,
        "percentage": 33.3
      },
      {
        "name": "专注力",
        "count": 4,
        "percentage": 26.7
      },
      {
        "name": "自律能力",
        "count": 3,
        "percentage": 20.0
      }
    ],
    "taskTrend": [
      {
        "date": "2023-09-05",
        "total": 2,
        "completed": 2
      },
      {
        "date": "2023-09-06",
        "total": 3,
        "completed": 2
      },
      {
        "date": "2023-09-07",
        "total": 2,
        "completed": 1
      },
      {
        "date": "2023-09-08",
        "total": 3,
        "completed": 2
      },
      {
        "date": "2023-09-09",
        "total": 2,
        "completed": 1
      },
      {
        "date": "2023-09-10",
        "total": 2,
        "completed": 1
      },
      {
        "date": "2023-09-11",
        "total": 1,
        "completed": 1
      }
    ]
  }
}
```

## 获取用户活动记录

### 请求

```
GET /api/user/activities
```

#### 请求头

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 查询参数

| 参数名   | 类型    | 必填 | 说明               |
|----------|---------|------|-------------------|
| type     | string  | 否   | 活动类型：task(任务)、shop(商城)、system(系统)、all(全部) |
| page     | integer | 否   | 页码，默认为1      |
| pageSize | integer | 否   | 每页数量，默认为10 |

### 响应

#### 成功响应

```json
{
  "code": 0,
  "message": "获取成功",
  "data": {
    "list": [
      {
        "id": 1005,
        "type": "task",
        "action": "complete",
        "description": "完成任务：每日读书30分钟",
        "createTime": "2023-09-11T10:30:00",
        "details": {
          "taskId": 1001,
          "taskTitle": "每日读书30分钟",
          "pointsEarned": 10
        }
      },
      {
        "id": 1004,
        "type": "shop",
        "action": "exchange",
        "description": "兑换商品：精美笔记本",
        "createTime": "2023-09-10T15:45:00",
        "details": {
          "productId": 1001,
          "productName": "精美笔记本",
          "quantity": 1,
          "pointsUsed": 100
        }
      },
      {
        "id": 1003,
        "type": "task",
        "action": "create",
        "description": "创建任务：完成数学作业",
        "createTime": "2023-09-10T14:20:00",
        "details": {
          "taskId": 1003,
          "taskTitle": "完成数学作业"
        }
      }
    ],
    "pagination": {
      "total": 25,
      "page": 1,
      "pageSize": 10,
      "totalPages": 3
    }
  }
}
``` 