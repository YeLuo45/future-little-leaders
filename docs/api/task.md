# 任务相关接口

## 获取任务列表

### 请求

```
GET /api/tasks
```

#### 请求头

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 查询参数

| 参数名    | 类型    | 必填 | 说明                             |
|-----------|---------|------|----------------------------------|
| status    | string  | 否   | 任务状态，可选值：ongoing(进行中)、completed(已完成)、all(全部) |
| tag       | string  | 否   | 筛选特定标签的任务              |
| page      | integer | 否   | 页码，默认为1                    |
| pageSize  | integer | 否   | 每页数量，默认为10               |
| isRecurring | boolean | 否 | 是否筛选周期性任务              |

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
      },
      {
        "id": 1002,
        "title": "整理房间",
        "completed": 30,
        "total": 30,
        "isCompleted": true,
        "tags": ["专注力"],
        "createdAt": "2023-09-03T09:00:00",
        "points": 5,
        "isRecurring": false
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

## 创建任务

### 请求

```
POST /api/tasks
```

#### 请求头

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 参数

| 参数名      | 类型     | 必填 | 说明                |
|-------------|----------|------|---------------------|
| title       | string   | 是   | 任务标题            |
| total       | integer  | 是   | 预计完成时间(分钟)  |
| tags        | string[] | 否   | 任务标签            |
| points      | integer  | 是   | 任务完成奖励积分    |
| isRecurring | boolean  | 否   | 是否为周期性任务，默认为false |
| recurringType | string | 否   | 周期类型：daily(每日)、weekly(每周)、monthly(每月)、custom(自定义) |
| recurringConfig | object | 否  | 周期配置信息        |

#### recurringConfig 参数说明

| 参数名      | 类型     | 必填 | 说明                |
|-------------|----------|------|---------------------|
| startDate   | string   | 是   | 开始日期，格式：YYYY-MM-DD |
| endDate     | string   | 否   | 结束日期，格式：YYYY-MM-DD，为空表示无限期 |
| frequency   | integer  | 是   | 频率，如每隔几天、每隔几周 |
| weekdays    | integer[] | 否  | 周几，weekly类型时使用，例如[1,3,5]表示周一、周三、周五 |
| monthDays   | integer[] | 否  | 每月的第几天，monthly类型时使用，例如[1,15]表示每月1号和15号 |
| specificTime | string  | 否   | 指定时间点，格式：HH:mm，为空则为当前时间 |

#### 请求示例1 - 创建普通任务

```json
{
  "title": "完成数学作业",
  "total": 45,
  "tags": ["学习能力", "专注力"],
  "points": 15
}
```

#### 请求示例2 - 创建每日任务

```json
{
  "title": "每日阅读英语",
  "total": 30,
  "tags": ["学习能力"],
  "points": 10,
  "isRecurring": true,
  "recurringType": "daily",
  "recurringConfig": {
    "startDate": "2023-10-01",
    "endDate": "2023-12-31",
    "frequency": 1,
    "specificTime": "08:00"
  }
}
```

#### 请求示例3 - 创建每周任务

```json
{
  "title": "参加瑜伽课",
  "total": 60,
  "tags": ["体育锻炼"],
  "points": 20,
  "isRecurring": true,
  "recurringType": "weekly",
  "recurringConfig": {
    "startDate": "2023-10-02",
    "endDate": null,
    "frequency": 1,
    "weekdays": [1, 3, 5],
    "specificTime": "18:30"
  }
}
```

#### 请求示例4 - 创建每月任务

```json
{
  "title": "月度复盘总结",
  "total": 120,
  "tags": ["自律能力"],
  "points": 50,
  "isRecurring": true,
  "recurringType": "monthly",
  "recurringConfig": {
    "startDate": "2023-10-25",
    "endDate": null,
    "frequency": 1,
    "monthDays": [25],
    "specificTime": "20:00"
  }
}
```

### 响应

#### 成功响应 - 普通任务

```json
{
  "code": 0,
  "message": "创建成功",
  "data": {
    "id": 1003,
    "title": "完成数学作业",
    "completed": 0,
    "total": 45,
    "isCompleted": false,
    "tags": ["学习能力", "专注力"],
    "createdAt": "2023-09-10T14:30:00",
    "points": 15,
    "isRecurring": false
  }
}
```

#### 成功响应 - 周期性任务

```json
{
  "code": 0,
  "message": "创建成功",
  "data": {
    "id": 1004,
    "title": "每日阅读英语",
    "completed": 0,
    "total": 30,
    "isCompleted": false,
    "tags": ["学习能力"],
    "createdAt": "2023-09-10T14:30:00",
    "points": 10,
    "isRecurring": true,
    "recurringType": "daily",
    "recurringConfig": {
      "startDate": "2023-10-01",
      "endDate": "2023-12-31",
      "frequency": 1,
      "specificTime": "08:00",
      "nextRefreshTime": "2023-10-02T08:00:00"
    }
  }
}
```

## 更新任务

### 请求

```
PUT /api/tasks/{taskId}
```

#### 请求头

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 路径参数

| 参数名 | 类型    | 必填 | 说明   |
|--------|---------|------|--------|
| taskId | integer | 是   | 任务ID |

#### 参数

| 参数名      | 类型     | 必填 | 说明                           |
|-------------|----------|------|---------------------------------|
| title       | string   | 否   | 任务标题                       |
| total       | integer  | 否   | 预计完成时间(分钟)             |
| completed   | integer  | 否   | 已完成时间(分钟)               |
| isCompleted | boolean  | 否   | 是否已完成                     |
| tags        | string[] | 否   | 任务标签                       |
| points      | integer  | 否   | 任务完成奖励积分               |
| isRecurring | boolean  | 否   | 是否为周期性任务               |
| recurringType | string | 否   | 周期类型                      |
| recurringConfig | object | 否  | 周期配置信息                  |

#### 请求示例 - 更新普通任务

```json
{
  "title": "完成高等数学作业",
  "total": 60,
  "completed": 30,
  "points": 20
}
```

#### 请求示例 - 更新周期性任务配置

```json
{
  "isRecurring": true,
  "recurringType": "weekly",
  "recurringConfig": {
    "frequency": 2,
    "weekdays": [2, 4]
  }
}
```

### 响应

#### 成功响应

```json
{
  "code": 0,
  "message": "更新成功",
  "data": {
    "id": 1003,
    "title": "完成高等数学作业",
    "completed": 30,
    "total": 60,
    "isCompleted": false,
    "tags": ["学习能力", "专注力"],
    "createdAt": "2023-09-10T14:30:00",
    "points": 20,
    "isRecurring": true,
    "recurringType": "weekly",
    "recurringConfig": {
      "startDate": "2023-10-01",
      "endDate": null,
      "frequency": 2,
      "weekdays": [2, 4],
      "nextRefreshTime": "2023-10-10T00:00:00"
    }
  }
}
```

## 获取任务刷新历史

### 请求

```
GET /api/tasks/{taskId}/refresh-history
```

#### 请求头

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 路径参数

| 参数名 | 类型    | 必填 | 说明   |
|--------|---------|------|--------|
| taskId | integer | 是   | 任务ID |

#### 查询参数

| 参数名    | 类型    | 必填 | 说明                |
|-----------|---------|------|---------------------|
| page      | integer | 否   | 页码，默认为1       |
| pageSize  | integer | 否   | 每页数量，默认为10  |

### 响应

#### 成功响应

```json
{
  "code": 0,
  "message": "获取成功",
  "data": {
    "list": [
      {
        "id": 2001,
        "taskId": 1004,
        "taskTitle": "每日阅读英语",
        "refreshTime": "2023-10-02T08:00:00",
        "status": "completed",
        "completionTime": "2023-10-02T09:30:00",
        "pointsEarned": 10
      },
      {
        "id": 2000,
        "taskId": 1004,
        "taskTitle": "每日阅读英语",
        "refreshTime": "2023-10-01T08:00:00",
        "status": "completed",
        "completionTime": "2023-10-01T10:15:00",
        "pointsEarned": 10
      }
    ],
    "pagination": {
      "total": 2,
      "page": 1,
      "pageSize": 10,
      "totalPages": 1
    }
  }
}
```

## 完成任务打卡

### 请求

```
POST /api/tasks/{taskId}/complete
```

#### 请求头

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 路径参数

| 参数名 | 类型    | 必填 | 说明   |
|--------|---------|------|--------|
| taskId | integer | 是   | 任务ID |

### 响应

#### 成功响应

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
      "tags": ["学习能力", "专注力"],
      "createdAt": "2023-09-10T14:30:00",
      "points": 20,
      "isRecurring": true,
      "recurringType": "weekly",
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

## 删除任务

### 请求

```
DELETE /api/tasks/{taskId}
```

#### 请求头

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 路径参数

| 参数名 | 类型    | 必填 | 说明   |
|--------|---------|------|--------|
| taskId | integer | 是   | 任务ID |

#### 查询参数

| 参数名         | 类型    | 必填 | 说明                                   |
|----------------|---------|------|---------------------------------------|
| deleteRecurring | boolean | 否   | 对于周期性任务，是否删除整个周期配置，默认为false |

### 响应

#### 成功响应

```json
{
  "code": 0,
  "message": "删除成功",
  "data": null
}
```

## 查询即将刷新的任务

### 请求

```
GET /api/tasks/upcoming-refresh
```

#### 请求头

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 查询参数

| 参数名    | 类型    | 必填 | 说明                           |
|-----------|---------|------|--------------------------------|
| days      | integer | 否   | 未来几天内将刷新的任务，默认为3 |
| page      | integer | 否   | 页码，默认为1                  |
| pageSize  | integer | 否   | 每页数量，默认为10             |

### 响应

#### 成功响应

```json
{
  "code": 0,
  "message": "获取成功",
  "data": {
    "list": [
      {
        "id": 1004,
        "title": "每日阅读英语",
        "tags": ["学习能力"],
        "points": 10,
        "recurringType": "daily",
        "nextRefreshTime": "2023-10-03T08:00:00",
        "timeUntilRefresh": {
          "hours": 10,
          "minutes": 30
        }
      },
      {
        "id": 1005,
        "title": "参加瑜伽课",
        "tags": ["体育锻炼"],
        "points": 20,
        "recurringType": "weekly",
        "nextRefreshTime": "2023-10-04T18:30:00",
        "timeUntilRefresh": {
          "days": 1,
          "hours": 21,
          "minutes": 0
        }
      }
    ],
    "pagination": {
      "total": 5,
      "page": 1,
      "pageSize": 10,
      "totalPages": 1
    }
  }
}
```

## 获取可用标签列表

### 请求

```
GET /api/tasks/tags
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
  "data": [
    {
      "name": "专注力",
      "color": "focus"
    },
    {
      "name": "财商",
      "color": "finance"
    },
    {
      "name": "学习能力",
      "color": "study"
    },
    {
      "name": "社交能力",
      "color": "social"
    },
    {
      "name": "创造力",
      "color": "creative"
    },
    {
      "name": "自律能力",
      "color": "discipline"
    },
    {
      "name": "体育锻炼",
      "color": "sports"
    }
  ]
}
``` 