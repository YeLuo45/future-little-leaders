# PRDV3 — 家庭圈（Family Circle）

**项目**：future-little-leaders
**版本**：V3
**日期**：2025-05-05
**状态**：草稿
**负责人**：小墨

---

## 1. 背景与目标

### 现状
- 当前 V2 已支持多宝宝（一个账号管理多个孩子 Profile）
- 但所有宝宝共用同一个家长账号，无法区分家庭成员角色
- 任务创建者和任务归属不清晰
- add-baby.vue 仍是 stub 页面

### V3 目标
建立家庭成员体系，让家里不同角色（爸爸/妈妈/爷爷/奶奶）都能参与育儿任务管理，实现"全家共建共享"的体验。

---

## 2. 功能模块

### M1. 家庭成员角色系统 ✅
**优先级**：P0

**功能点**：✅ 已完成
- 成员角色类型：爸爸、妈妈、爷爷、奶奶、其他
- 每个角色有唯一昵称和头像
- 主账号（创建者）默认"家长"角色，可邀请其他成员
- 成员可查看和操作自己创建的宝宝任务
- 成员不可操作其他成员的任务（除非主动授权）

**数据模型**：✅ 已实现
```js
// family_member
{
  id: string,
  role: 'father' | 'mother' | 'grandpa' | 'grandma' | 'other',
  nickname: string,
  avatar: string, // localStorage base64 or url
  createdAt: timestamp,
  isOwner: boolean
}

// invite_code
{
  code: string(6位), // e.g. "ABC123"
  createdBy: memberId,
  createdAt: timestamp,
  used: boolean,
  usedBy: memberId | null
}
```

**UI**：✅ 已完成
- profile.vue 添加"家庭成员"入口（通知入口旁）
- family-members.vue — 成员列表 + 角色标签 + 邀请码生成
- invite-join.vue — 输入邀请码加入家庭

---

### M2. 任务归属优化 ✅
**优先级**：P0

**功能点**：✅ 已完成
- 每条任务记录增加 `createdBy` 字段（memberId）
- 任务筛选支持"只看我的"和"全家任务"
- 创建任务时选择执行宝宝 + 创建者（默认当前登录成员）

**UI**：✅ 已完成
- index.vue 任务列表顶部加 tab：全部 / 我的 / 家庭共享
- add-task.vue 选择宝宝后默认选当前成员

---

### M3. 家庭共享任务池 ✅ (部分)
**优先级**：P1

**功能点**：✅ 已完成（作为M2的一部分）
- 创建任务时可选"家庭共享"开关
- 共享任务所有家庭成员可见可打卡
- 非共享任务仅创建者可见

**UI**：✅ 已完成
- 任务卡片标识"👨‍👩‍👧‍👦 家庭共享"标签
- 筛选页加"家庭任务"勾选框

---

### M4. 宝宝头像优化 ✅
**优先级**：P1

**功能点**：✅ 已完成
- add-baby.vue 完整实现：姓名、生日、性别、头像上传
- 头像支持本地相册选择（uni-app chooseImage）
- baby-management.vue 宝宝卡片显示头像

**UI**：✅ 已完成
- add-baby.vue 完整表单
- baby-management.vue 头像圆形展示

---

### M5. 家庭数据概览
**优先级**：P2

**功能点**：
- 家庭首页仪表盘：本周全家任务完成数、全家连续打卡天数
- 成员贡献排行：谁创建的任务最多/谁打卡最勤

**UI**：
- profile.vue 新增"家庭数据"折叠区
- 家庭积分池（所有宝宝积分总和 + 各成员贡献）

---

## 3. 现有模块改造

| 模块 | 改造内容 |
|------|----------|
| reportStore | 增加 familyId 维度统计 |
| achievementStore | "全员坚持"成就解锁逻辑需要家庭共享任务数据 |
| taskTemplateStore | 模板创建者标记 |
| reminderStore | 通知区分家庭成员 |
| profile.vue | 添加家庭成员入口、宝宝头像显示 |
| index.vue | 任务筛选"我的/全部/家庭共享" |
| add-task.vue | 宝宝选择 + 创建者归属 + 家庭共享开关 |
| baby-management.vue | 头像展示 |

---

## 4. 验收标准

### M1 — 家庭成员角色 ✅
- [x] 可生成6位邀请码
- [x] 可用邀请码加入（输入正确码后出现角色选择）
- [x] 成员列表显示角色、昵称、头像
- [x] 主账号可见所有成员，普通成员只能看到自己和宝宝

### M2 — 任务归属 ✅
- [x] 新建任务自动带 createdBy
- [x] 任务列表"我的"只显示自己创建的任务
- [x] 任务列表"全部"显示家庭所有任务

### M3 — 家庭共享任务 ✅
- [x] 任务卡片显示"家庭共享"标签
- [x] 共享任务其他成员也可打卡
- [x] 非共享任务其他成员不可见

### M4 — 宝宝头像 ✅
- [x] add-baby.vue 可选择本地图片作为头像
- [x] baby-management.vue 圆形头像显示
- [x] 头像持久化到 localStorage

### M5 — 家庭数据概览
- [ ] 显示家庭成员数量
- [ ] 显示全家本周完成任务数
- [ ] 显示家庭积分池总量

---

## 5. 技术实现

**技术栈**：uni-app + Vue3 + Pinia + localStorage

**存储结构**：
```js
// localStorage
'family_members'      // 家庭成员列表
'family_invite_codes' // 邀请码记录
'current_member_id'   // 当前登录成员ID
'babies'              // 宝宝列表（已有，新增 memberId 关联）
'tasks'               // 任务列表（已有，新增 createdBy）
```

**不涉及后端**，所有数据存 localStorage/会话级别，通过邀请码的 base64 编码传递家庭ID（会话共享）。

---

## 6. 优先级与排期

| 模块 | 优先级 | 说明 |
|------|--------|------|
| M1 家庭成员角色 | P0 | 核心架构，成员体系 |
| M2 任务归属 | P0 | 依赖 M1 |
| M4 宝宝头像 | P1 | add-baby.vue stub 补全 |
| M3 家庭共享任务 | P1 | 差异化功能 |
| M5 家庭数据概览 | P2 | 锦上添花 |

---

## 7. 风险

- 邀请码如果只用 localStorage，换设备后无法同步（可接受，后续 B 方向再上云）
- 当前 profile.vue 的 picker 已经支持多宝宝切换，M1 需确认不破坏现有切换逻辑
- 成就"全员坚持"需要等 M3 完成后才有意义解锁时机
