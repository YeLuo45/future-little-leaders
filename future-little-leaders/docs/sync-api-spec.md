# V4 Sync API 规格说明

> Version: 1.0.0
> 状态：代码已完成，部署待 boss 确认

## 概述

本系统实现了一个轻量级 delta sync 协议，用于多设备间数据同步。参考 thunderbolt-design 的 PowerSync 架构，采用 Last-Write-Wins (LWW) 冲突解决策略。

## 基础信息

- **协议**: HTTPS JSON REST
- **认证**: JWT（familyId 编码在 token 内，无明文密码）
- **部署**: Cloudflare Workers（免费 Tier）
- **存储**: Cloudflare D1（SQLite）或 KV

---

## 接口规格

### 1. Push — 推送本地变更

**端点**: `POST /api/sync/push`

**请求**:
```json
{
  "changes": [
    {
      "id": 123,
      "table_name": "tasks",
      "row_id": "uuid-xxx",
      "operation": "insert",
      "payload": { "id": "uuid-xxx", "title": "早起刷牙", ... },
      "timestamp": "2026-05-17T12:00:00.000Z"
    }
  ]
}
```

**响应**（200 OK）:
```json
{
  "acknowledged": [123, 124, 125]
}
```
`acknowledged` 数组包含服务端成功处理的 change_log ID 列表，客户端据此标记本地记录为已同步。

**错误**:
- `401 Unauthorized`: JWT 无效或过期
- `400 Bad Request`: 请求体格式错误

---

### 2. Pull — 拉取 Delta

**端点**: `GET /api/sync/pull?since=2026-05-17T10:00:00.000Z`

**Query 参数**:
- `since`（必需）: ISO 8601 时间戳，返回此时间之后的所有变更

**响应**（200 OK）:
```json
{
  "changes": [
    {
      "id": 456,
      "table_name": "tasks",
      "row_id": "uuid-yyy",
      "operation": "update",
      "payload": { "id": "uuid-yyy", "title": "早起刷牙（已修改）", ... },
      "timestamp": "2026-05-17T11:30:00.000Z"
    }
  ],
  "serverTime": "2026-05-17T12:00:00.000Z"
}
```

---

### 3. Full — 全量下载（首次同步）

**端点**: `GET /api/sync/full`

**响应**（200 OK）:
```json
{
  "family_members": [...],
  "babies": [...],
  "tasks": [...],
  "checkins": [...],
  "achievements": [...],
  "points": [...]
}
```

---

## JWT Token 结构

```json
{
  "familyId": "家庭的唯一ID",
  "iat": 1715944800,
  "exp": 1893456000
}
```

- `familyId` 是 base64 编码的家庭标识
- 无需单独登录，token 在 Setup 时生成并分发给各设备
- 可选：加密 payload（本次不启用）

---

## 冲突解决

采用 **Last-Write-Wins (LWW)** 策略：

1. 每次变更携带 `timestamp`（ISO 8601，精确到毫秒）
2. 合并时比较本地 `updatedAt` vs 远程 `timestamp`
3. 时间较新的覆盖旧记录
4. 删除操作 `operation: 'delete'` 始终生效

**边界情况**:
- 双方同时修改同一字段 → 时间晚的胜出
- 本地 insert，远程也 insert 同一 ID → 保留两者（一般不会发生，正常 ID 由 uuid 生成）
- 远程已 delete，本地再 update → 以 delete 为准

---

## 增量与清理

- 服务器保留**30天**的变更历史
- 超过 30 天的 change_log 自动清理
- 客户端同步成功后 `markSynced(ids)` 标记本地已同步
- 已同步的 change_log 在**下次 App 启动时**（或定时）清理

---

## 暂不部署原因

- 需要 boss 提供 Cloudflare 账号或确认部署方案
- E2E 加密密钥管理需要额外 UI（密钥分享、3次错误锁定）
- 本次 V4 先完成代码，待 boss 确认后一键部署

---

## 后续扩展

1. **真实后端**: Cloudflare Workers + D1
2. **端到端加密**: 加密粒度细化到每个 family member 独立密钥
3. **增量导入**: 将 SQLite 整个文件加密后上传/下载（适合首次 Setup）