# 积分商城相关接口

## 获取商品列表

### 请求

```
GET /api/shop/products
```

#### 请求头

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 查询参数

| 参数名    | 类型    | 必填 | 说明                             |
|-----------|---------|------|----------------------------------|
| category  | string  | 否   | 商品分类                         |
| keyword   | string  | 否   | 搜索关键词                       |
| page      | integer | 否   | 页码，默认为1                    |
| pageSize  | integer | 否   | 每页数量，默认为10               |
| sortBy    | string  | 否   | 排序方式，可选值：price（价格）、popularity（热度） |
| sortOrder | string  | 否   | 排序顺序，可选值：asc（升序）、desc（降序）|

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
        "name": "精美笔记本",
        "description": "高质量硬皮笔记本，适合学习记录",
        "price": 100,
        "image": "https://example.com/images/notebook.jpg",
        "category": "学习用品",
        "stock": 50,
        "popularity": 95
      },
      {
        "id": 1002,
        "name": "荧光笔套装",
        "description": "6色荧光笔，标记重点更醒目",
        "price": 50,
        "image": "https://example.com/images/highlighter.jpg",
        "category": "学习用品",
        "stock": 100,
        "popularity": 87
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

## 获取商品详情

### 请求

```
GET /api/shop/products/{productId}
```

#### 请求头

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 路径参数

| 参数名    | 类型    | 必填 | 说明    |
|-----------|---------|------|---------|
| productId | integer | 是   | 商品ID  |

### 响应

#### 成功响应

```json
{
  "code": 0,
  "message": "获取成功",
  "data": {
    "id": 1001,
    "name": "精美笔记本",
    "description": "高质量硬皮笔记本，适合学习记录",
    "detailDescription": "精美笔记本采用优质纸张，每页纸张厚度适中，不易透墨。硬皮封面提供良好保护，使用寿命长。内置书签绳，方便标记重要页面。规格：A5大小，100页。",
    "price": 100,
    "image": "https://example.com/images/notebook.jpg",
    "imageGallery": [
      "https://example.com/images/notebook_1.jpg",
      "https://example.com/images/notebook_2.jpg",
      "https://example.com/images/notebook_3.jpg"
    ],
    "category": "学习用品",
    "stock": 50,
    "popularity": 95,
    "exchangeCount": 120
  }
}
```

## 兑换商品

### 请求

```
POST /api/shop/exchange
```

#### 请求头

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 参数

| 参数名    | 类型    | 必填 | 说明     |
|-----------|---------|------|----------|
| productId | integer | 是   | 商品ID   |
| quantity  | integer | 是   | 兑换数量 |

#### 请求示例

```json
{
  "productId": 1001,
  "quantity": 2
}
```

### 响应

#### 成功响应

```json
{
  "code": 0,
  "message": "兑换成功",
  "data": {
    "orderNo": "EX202309100001",
    "productName": "精美笔记本",
    "quantity": 2,
    "totalPoints": 200,
    "exchangeTime": "2023-09-10T15:30:00",
    "userPoints": {
      "before": 500,
      "after": 300
    }
  }
}
```

#### 失败响应 - 积分不足

```json
{
  "code": 1001,
  "message": "积分不足",
  "data": {
    "required": 200,
    "available": 150
  }
}
```

#### 失败响应 - 库存不足

```json
{
  "code": 1002,
  "message": "商品库存不足",
  "data": {
    "required": 2,
    "available": 1
  }
}
```

## 获取兑换历史

### 请求

```
GET /api/shop/exchange-history
```

#### 请求头

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 查询参数

| 参数名    | 类型    | 必填 | 说明                |
|-----------|---------|------|---------------------|
| page      | integer | 否   | 页码，默认为1       |
| pageSize  | integer | 否   | 每页数量，默认为10  |
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
        "orderNo": "EX202309100001",
        "productId": 1001,
        "productName": "精美笔记本",
        "productImage": "https://example.com/images/notebook.jpg",
        "quantity": 2,
        "totalPoints": 200,
        "exchangeTime": "2023-09-10T15:30:00",
        "status": "completed"
      },
      {
        "id": 1002,
        "orderNo": "EX202309080001",
        "productId": 1002,
        "productName": "荧光笔套装",
        "productImage": "https://example.com/images/highlighter.jpg",
        "quantity": 1,
        "totalPoints": 50,
        "exchangeTime": "2023-09-08T10:15:00",
        "status": "completed"
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

## 获取商品分类

### 请求

```
GET /api/shop/categories
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
      "id": 1,
      "name": "学习用品",
      "icon": "book"
    },
    {
      "id": 2,
      "name": "电子产品",
      "icon": "mobile"
    },
    {
      "id": 3,
      "name": "生活用品",
      "icon": "home"
    },
    {
      "id": 4,
      "name": "食品饮料",
      "icon": "coffee"
    },
    {
      "id": 5,
      "name": "虚拟商品",
      "icon": "gift"
    }
  ]
}
```

## 管理接口 - 添加商品

### 请求

```
POST /api/shop/admin/products
```

#### 请求头

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 参数

| 参数名             | 类型     | 必填 | 说明                |
|--------------------|----------|------|---------------------|
| name               | string   | 是   | 商品名称            |
| description        | string   | 是   | 商品简介            |
| detailDescription  | string   | 否   | 详细描述            |
| price              | integer  | 是   | 商品积分价格        |
| image              | string   | 是   | 商品主图URL         |
| imageGallery       | string[] | 否   | 商品图片集合        |
| category           | string   | 是   | 商品分类            |
| stock              | integer  | 是   | 商品库存            |

#### 请求示例

```json
{
  "name": "机械键盘",
  "description": "游戏专用机械键盘，青轴",
  "detailDescription": "采用德国原厂轴体，带背光，键位可编程，人体工学设计，使用寿命超过5000万次按键。",
  "price": 500,
  "image": "https://example.com/images/keyboard.jpg",
  "imageGallery": [
    "https://example.com/images/keyboard_1.jpg",
    "https://example.com/images/keyboard_2.jpg"
  ],
  "category": "电子产品",
  "stock": 20
}
```

### 响应

#### 成功响应

```json
{
  "code": 0,
  "message": "添加成功",
  "data": {
    "id": 1003,
    "name": "机械键盘",
    "description": "游戏专用机械键盘，青轴",
    "detailDescription": "采用德国原厂轴体，带背光，键位可编程，人体工学设计，使用寿命超过5000万次按键。",
    "price": 500,
    "image": "https://example.com/images/keyboard.jpg",
    "imageGallery": [
      "https://example.com/images/keyboard_1.jpg",
      "https://example.com/images/keyboard_2.jpg"
    ],
    "category": "电子产品",
    "stock": 20,
    "popularity": 0,
    "exchangeCount": 0,
    "createTime": "2023-09-11T09:30:00"
  }
}
```

## 管理接口 - 更新商品

### 请求

```
PUT /api/shop/admin/products/{productId}
```

#### 请求头

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 路径参数

| 参数名    | 类型    | 必填 | 说明    |
|-----------|---------|------|---------|
| productId | integer | 是   | 商品ID  |

#### 参数

| 参数名             | 类型     | 必填 | 说明                |
|--------------------|----------|------|---------------------|
| name               | string   | 否   | 商品名称            |
| description        | string   | 否   | 商品简介            |
| detailDescription  | string   | 否   | 详细描述            |
| price              | integer  | 否   | 商品积分价格        |
| image              | string   | 否   | 商品主图URL         |
| imageGallery       | string[] | 否   | 商品图片集合        |
| category           | string   | 否   | 商品分类            |
| stock              | integer  | 否   | 商品库存            |

#### 请求示例

```json
{
  "price": 450,
  "stock": 30,
  "description": "游戏专用机械键盘，青轴，带RGB背光"
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
    "name": "机械键盘",
    "description": "游戏专用机械键盘，青轴，带RGB背光",
    "detailDescription": "采用德国原厂轴体，带背光，键位可编程，人体工学设计，使用寿命超过5000万次按键。",
    "price": 450,
    "image": "https://example.com/images/keyboard.jpg",
    "imageGallery": [
      "https://example.com/images/keyboard_1.jpg",
      "https://example.com/images/keyboard_2.jpg"
    ],
    "category": "电子产品",
    "stock": 30,
    "popularity": 0,
    "exchangeCount": 0,
    "updateTime": "2023-09-11T10:15:00"
  }
}
```

## 管理接口 - 删除商品

### 请求

```
DELETE /api/shop/admin/products/{productId}
```

#### 请求头

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 路径参数

| 参数名    | 类型    | 必填 | 说明    |
|-----------|---------|------|---------|
| productId | integer | 是   | 商品ID  |

### 响应

#### 成功响应

```json
{
  "code": 0,
  "message": "删除成功",
  "data": null
}
``` 