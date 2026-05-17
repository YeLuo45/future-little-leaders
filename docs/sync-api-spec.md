# V4 Sync API Specification

## Overview

The V4 sync system uses a change-log based approach with Last-Write-Wins (LWW) conflict resolution.

## Authentication

All sync endpoints require JWT authentication via `Authorization: Bearer <token>` header.

### JWT Token Structure

```json
{
  "sub": "user_id",
  "deviceId": "device_abc123",
  "familyId": "family_xyz",
  "iat": 1699999999,
  "exp": 1699999999
}
```

## Endpoints

### 1. Push Changes

Upload local change log entries to server.

**Endpoint:** `POST /api/sync/push`

**Request:**
```json
{
  "changes": [
    {
      "id": 123,
      "tableName": "babies",
      "rowId": "uuid-123",
      "operation": "insert",
      "payload": {
        "deviceId": "device_abc123",
        "data": { ... row data as JSON string ... }
      },
      "timestamp": "2024-01-15T10:30:00.000Z",
      "synced": 0
    }
  ]
}
```

**Response (200):**
```json
{
  "success": true,
  "syncedIds": [123, 124, 125],
  "serverTs": "2024-01-15T10:30:01.000Z"
}
```

### 2. Pull Changes

Fetch changes from server since a given timestamp.

**Endpoint:** `GET /api/sync/pull?since=<ISO timestamp>`

**Response (200):**
```json
{
  "success": true,
  "changes": [
    {
      "tableName": "babies",
      "rowId": "uuid-456",
      "operation": "update",
      "payload": {
        "deviceId": "device_def456",
        "data": { ... updated row data ... }
      },
      "timestamp": "2024-01-15T10:25:00.000Z"
    }
  ],
  "serverTs": "2024-01-15T10:30:01.000Z"
}
```

### 3. Full Sync

Combined push and pull for initial sync or recovery.

**Endpoint:** `POST /api/sync/full`

**Request:**
```json
{
  "changes": [ ... local unsynced changes ... ],
  "since": "2024-01-15T10:00:00.000Z"
}
```

**Response (200):**
```json
{
  "success": true,
  "pushed": {
    "syncedIds": [123, 124]
  },
  "pulled": {
    "changes": [ ... remote changes ... ],
    "serverTs": "2024-01-15T10:30:01.000Z"
  }
}
```

## Conflict Resolution (LWW)

**Last-Write-Wins** - When a conflict occurs (same row modified on multiple devices), the record with the later `updatedAt` timestamp wins.

### Conflict Scenarios

1. **Local insert vs Remote insert**: First one to sync wins, second gets a conflict (rare, usually handled by UUID)

2. **Local update vs Remote update**: The record with the later `updatedAt` timestamp is kept

3. **Local update vs Remote delete**: Delete wins (data is removed)

4. **Local delete vs Remote update**: The update is discarded (already deleted)

## Data Model

### Tables

- `family_members`: id, name, role, avatar, createdAt, updatedAt
- `babies`: id, name, gender, birthdate, avatar, createdAt, updatedAt
- `tasks`: id, title, description, tags, type, recurringType, weekdays, monthDays, customStartTime, customEndTime, total, points, completed, status, babyId, createdAt, updatedAt
- `checkins`: id, babyId, taskId, checkinTime, photo, notes, createdAt, updatedAt
- `achievements`: id, babyId, achievementType, title, description, icon, unlockedAt, createdAt, updatedAt
- `points`: id, babyId, points, description, type, createdAt, updatedAt
- `change_log`: id, tableName, rowId, operation, payload, timestamp, synced

### Operation Types

- `insert`: New record created
- `update`: Existing record modified
- `delete`: Record deleted (payload contains only id)

## Error Handling

All endpoints return appropriate HTTP status codes:

- `200`: Success
- `400`: Bad request (invalid JSON, missing fields)
- `401`: Unauthorized (invalid/missing JWT)
- `403`: Forbidden (no access to family)
- `500`: Server error

Network failures are handled gracefully - the client will retry on next sync cycle.