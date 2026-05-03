# 育儿社区 API 文档

本文档详细说明了育儿社区模块的API接口设计、参数和返回值，以便前后端开发人员进行对接。

## 目录

- [主题列表接口](#主题列表接口)
- [主题详情接口](#主题详情接口)
- [发布主题接口](#发布主题接口)
- [评论接口](#评论接口)
- [点赞接口](#点赞接口)
- [收藏接口](#收藏接口)
- [搜索接口](#搜索接口)
- [举报接口](#举报接口)
- [数据结构](#数据结构)
- [错误码说明](#错误码说明)

## 主题列表接口

获取社区主题列表，支持分页、分类和排序。

### 请求方式

```
GET /api/community/topics
```

### 请求参数

| 参数名 | 类型 | 必须 | 说明 |
|-------|------|------|------|
| page | Integer | 否 | 页码，默认为1 |
| pageSize | Integer | 否 | 每页条数，默认为10，最大50 |
| category | String | 否 | 主题分类，如不指定则获取全部分类 |
| sort | String | 否 | 排序方式：new(最新)、hot(热门)、recommend(推荐)，默认为new |
| keyword | String | 否 | 搜索关键词 |

### 返回结果

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 120,
    "current_page": 1,
    "page_size": 10,
    "total_pages": 12,
    "list": [
      {
        "id": 1,
        "title": "如何培养孩子的阅读习惯?",
        "brief": "分享一下大家的经验，我家孩子对图书不太感兴趣...",
        "category": "education",
        "category_name": "教育方法",
        "author": {
          "id": 101,
          "username": "书香妈妈",
          "avatar": "https://example.com/avatar/101.jpg"
        },
        "publish_time": "2023-09-29 15:30:00",
        "update_time": "2023-09-29 16:45:00",
        "comments_count": 23,
        "likes_count": 45,
        "views_count": 352,
        "is_top": false,
        "is_essence": true,
        "icon": "📚"
      },
      // 更多主题...
    ]
  }
}
```

## 主题详情接口

获取社区主题详情内容，包括评论列表。

### 请求方式

```
GET /api/community/topics/{topicId}
```

### 请求参数

| 参数名 | 类型 | 必须 | 说明 |
|-------|------|------|------|
| topicId | Integer | 是 | 主题ID |
| page | Integer | 否 | 评论页码，默认为1 |
| pageSize | Integer | 否 | 评论每页条数，默认为20 |

### 返回结果

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "title": "如何培养孩子的阅读习惯?",
    "content": "最近发现孩子对阅读不太感兴趣，每次给他看书都会很快失去耐心。我尝试了给他读故事，也买了很多有趣的绘本，但效果都不太理想。\n\n有没有家长可以分享一下培养孩子阅读习惯的经验和方法？什么样的书更容易吸引孩子？什么时间段阅读效果更好？如何让阅读成为孩子生活中自然而然的一部分？",
    "category": "education",
    "category_name": "教育方法",
    "author": {
      "id": 101,
      "username": "书香妈妈",
      "avatar": "https://example.com/avatar/101.jpg",
      "signature": "热爱阅读的二胎妈妈",
      "level": 3,
      "is_following": false
    },
    "publish_time": "2023-09-29 15:30:00",
    "update_time": "2023-09-29 16:45:00",
    "comments_count": 23,
    "likes_count": 45,
    "views_count": 352,
    "is_top": false,
    "is_essence": true,
    "is_liked": false,
    "is_collected": false,
    "images": [
      "https://example.com/images/topics/1/1.jpg",
      "https://example.com/images/topics/1/2.jpg"
    ],
    "comments": {
      "total": 23,
      "current_page": 1,
      "page_size": 20,
      "total_pages": 2,
      "list": [
        {
          "id": 101,
          "content": "建议从孩子的兴趣出发选择书籍，比如喜欢恐龙的可以先看恐龙图鉴，培养起兴趣后再慢慢延伸到其他类型的书。",
          "author": {
            "id": 201,
            "username": "绘本达人",
            "avatar": "https://example.com/avatar/201.jpg",
            "level": 4
          },
          "publish_time": "2023-09-29 16:15:00",
          "likes_count": 12,
          "is_liked": false,
          "replies": [
            {
              "id": 102,
              "content": "谢谢建议，我会尝试找一些他感兴趣的主题。",
              "author": {
                "id": 101,
                "username": "书香妈妈",
                "avatar": "https://example.com/avatar/101.jpg",
                "level": 3
              },
              "publish_time": "2023-09-29 16:30:00",
              "reply_to": {
                "id": 201,
                "username": "绘本达人"
              }
            }
          ]
        },
        // 更多评论...
      ]
    }
  }
}
```

## 发布主题接口

发布新的社区主题。

### 请求方式

```
POST /api/community/topics
```

### 请求参数

| 参数名 | 类型 | 必须 | 说明 |
|-------|------|------|------|
| title | String | 是 | 主题标题，长度限制：5-50个字符 |
| content | String | 是 | 主题内容，长度限制：10-5000个字符 |
| category | String | 是 | 主题分类 |
| images | Array | 否 | 图片数组，URL格式，最多9张 |
| icon | String | 否 | 主题图标 |

### 返回结果

```json
{
  "code": 200,
  "message": "发布成功",
  "data": {
    "topic_id": 123
  }
}
```

## 评论接口

### 发表评论

#### 请求方式

```
POST /api/community/topics/{topicId}/comments
```

#### 请求参数

| 参数名 | 类型 | 必须 | 说明 |
|-------|------|------|------|
| topicId | Integer | 是 | 主题ID |
| content | String | 是 | 评论内容，长度限制：1-500个字符 |
| parent_id | Integer | 否 | 父评论ID，回复某条评论时使用 |
| reply_to | Integer | 否 | 回复的用户ID |

#### 返回结果

```json
{
  "code": 200,
  "message": "评论成功",
  "data": {
    "comment_id": 456,
    "publish_time": "2023-09-30 10:15:30"
  }
}
```

### 删除评论

#### 请求方式

```
DELETE /api/community/comments/{commentId}
```

#### 请求参数

| 参数名 | 类型 | 必须 | 说明 |
|-------|------|------|------|
| commentId | Integer | 是 | 评论ID |

#### 返回结果

```json
{
  "code": 200,
  "message": "删除成功"
}
```

## 点赞接口

### 点赞主题

#### 请求方式

```
POST /api/community/topics/{topicId}/like
```

#### 请求参数

| 参数名 | 类型 | 必须 | 说明 |
|-------|------|------|------|
| topicId | Integer | 是 | 主题ID |

#### 返回结果

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "is_liked": true,
    "likes_count": 46
  }
}
```

### 取消点赞主题

#### 请求方式

```
DELETE /api/community/topics/{topicId}/like
```

#### 请求参数

| 参数名 | 类型 | 必须 | 说明 |
|-------|------|------|------|
| topicId | Integer | 是 | 主题ID |

#### 返回结果

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "is_liked": false,
    "likes_count": 45
  }
}
```

### 点赞评论

#### 请求方式

```
POST /api/community/comments/{commentId}/like
```

#### 请求参数

| 参数名 | 类型 | 必须 | 说明 |
|-------|------|------|------|
| commentId | Integer | 是 | 评论ID |

#### 返回结果

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "is_liked": true,
    "likes_count": 13
  }
}
```

### 取消点赞评论

#### 请求方式

```
DELETE /api/community/comments/{commentId}/like
```

#### 请求参数

| 参数名 | 类型 | 必须 | 说明 |
|-------|------|------|------|
| commentId | Integer | 是 | 评论ID |

#### 返回结果

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "is_liked": false,
    "likes_count": 12
  }
}
```

## 收藏接口

### 收藏主题

#### 请求方式

```
POST /api/community/topics/{topicId}/collect
```

#### 请求参数

| 参数名 | 类型 | 必须 | 说明 |
|-------|------|------|------|
| topicId | Integer | 是 | 主题ID |

#### 返回结果

```json
{
  "code": 200,
  "message": "收藏成功",
  "data": {
    "is_collected": true
  }
}
```

### 取消收藏主题

#### 请求方式

```
DELETE /api/community/topics/{topicId}/collect
```

#### 请求参数

| 参数名 | 类型 | 必须 | 说明 |
|-------|------|------|------|
| topicId | Integer | 是 | 主题ID |

#### 返回结果

```json
{
  "code": 200,
  "message": "取消收藏成功",
  "data": {
    "is_collected": false
  }
}
```

## 搜索接口

搜索社区内容。

### 请求方式

```
GET /api/community/search
```

### 请求参数

| 参数名 | 类型 | 必须 | 说明 |
|-------|------|------|------|
| keyword | String | 是 | 搜索关键词 |
| type | String | 否 | 搜索类型：all(全部)、topic(主题)、comment(评论)，默认为all |
| category | String | 否 | 主题分类，如不指定则搜索全部分类 |
| page | Integer | 否 | 页码，默认为1 |
| pageSize | Integer | 否 | 每页条数，默认为10 |

### 返回结果

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 42,
    "current_page": 1,
    "page_size": 10,
    "total_pages": 5,
    "list": [
      {
        "id": 1,
        "title": "如何培养孩子的阅读习惯?",
        "brief": "分享一下大家的经验，我家孩子对图书不太感兴趣...",
        "category": "education",
        "category_name": "教育方法",
        "author": {
          "id": 101,
          "username": "书香妈妈",
          "avatar": "https://example.com/avatar/101.jpg"
        },
        "publish_time": "2023-09-29 15:30:00",
        "comments_count": 23,
        "likes_count": 45,
        "views_count": 352,
        "icon": "📚",
        "highlight": {
          "title": "如何培养孩子的<em>阅读</em>习惯?",
          "brief": "分享一下大家的经验，我家孩子对图书不太感兴趣..."
        }
      },
      // 更多搜索结果...
    ]
  }
}
```

## 举报接口

举报不良内容。

### 请求方式

```
POST /api/community/report
```

### 请求参数

| 参数名 | 类型 | 必须 | 说明 |
|-------|------|------|------|
| target_id | Integer | 是 | 举报目标ID |
| target_type | String | 是 | 举报目标类型：topic(主题)、comment(评论) |
| reason | String | 是 | 举报原因：spam(垃圾广告)、porn(色情内容)、violence(暴力内容)、fraud(诈骗)、other(其他) |
| description | String | 否 | 举报详细描述，当reason为other时必填 |

### 返回结果

```json
{
  "code": 200,
  "message": "举报成功，我们会尽快处理"
}
```

## 数据结构

### 主题分类

| 分类ID | 分类名称 |
|-------|---------|
| parenting | 育儿经验 |
| education | 教育方法 |
| nutrition | 营养健康 |
| games | 亲子游戏 |
| psychology | 儿童心理 |
| books | 阅读推荐 |

## 错误码说明

| 错误码 | 说明 |
|-------|------|
| 400 | 请求参数错误 |
| 401 | 未授权，请先登录 |
| 403 | 无权操作 |
| 404 | 资源不存在 |
| 429 | 请求过于频繁 |
| 500 | 服务器内部错误 |

### 常见错误示例

```json
{
  "code": 400,
  "message": "标题长度应在5-50个字符之间",
  "data": null
}
```

```json
{
  "code": 403,
  "message": "您无权删除此评论",
  "data": null
}
``` 