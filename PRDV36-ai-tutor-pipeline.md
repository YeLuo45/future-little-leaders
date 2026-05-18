# PRDV36 — AI Tutor Pipeline — Multi-Agent Collaborative Learning

**项目**：future-little-leaders
**版本**：V36
**日期**：2025-05-19
**状态**：开发中
**负责人**：Hermes Agent

---

## 1. 背景与目标

### 现状
- V34 已实现 AI Companion Buddy（单一 AI 伙伴，支持日常对话和简单辅导）
- V19 已实现 AI Recommend（任务推荐引擎）
- AI 功能均为单 Agent 模式，缺乏多 Agent 协作能力

### V36 目标
建立 **Multi-Agent AI Tutor Pipeline**，让多个专业化 AI Agent（数学导师、语文导师、英语导师、生活导师）协同工作，通过管道式协作，为孩子提供全方位、个性化的学习辅导体验。

---

## 2. 核心概念

### 2.1 Multi-Agent 架构

```
┌─────────────────────────────────────────────────────────┐
│                    OrchestratorAgent                     │
│              (协调器 - 理解意图，分发任务)                │
└─────────────────────┬───────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┬─────────────┐
        ▼             ▼             ▼             ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ MathAgent   │ │ChineseAgent │ │EnglishAgent │ │ LifeAgent   │
│ 数学导师     │ │ 语文导师     │ │ 英语导师     │ │ 生活导师     │
└─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘
```

### 2.2 Agent 专业领域

| Agent | 专长 | 关键词 |
|-------|------|--------|
| MathAgent | 数学思维、计算训练、应用题 | 数学、计算、加减乘除、图形 |
| ChineseAgent | 拼音、识字、阅读理解、写作 | 语文、拼音、写字、阅读 |
| EnglishAgent | 单词记忆、口语练习、听力 | 英语、单词、口语、字母 |
| LifeAgent | 自理能力、安全教育、礼仪 | 整理、穿衣、安全、文明 |

### 2.3 Tutor Pipeline 流程

```
用户输入 → 意图识别 → Agent调度 → 协作辅导 → 个性化反馈
                │
                ▼
        ┌───────────────┐
        │ Orchestrator  │ ←── 历史上下文管理
        └───────┬───────┘
                │ 可能触发多个Agent
                ▼
        ┌───┐ ┌───┐ ┌───┐ ┌───┐
        │ M │ │ C │ │ E │ │ L │  (并行/串行协作)
        └───┘ └───┘ └───┘ └───┘
```

---

## 3. 功能模块

### M1. 多 Agent 系统 ✅
**优先级**：P0

**功能点**：
- OrchestratorAgent：意图识别 + 任务分发
- MathAgent：数学专项辅导（计算题、应用题、思维训练）
- ChineseAgent：语文专项辅导（拼音、识字、阅读、写作）
- EnglishAgent：英语专项辅导（单词、口语、听力）
- LifeAgent：生活技能辅导（自理、安全、礼仪）

**Agent 能力**：
- 每个 Agent 有独立的专业知识库
- 支持多轮对话上下文
- 可输出带步骤的解题过程
- 支持表扬、鼓励、纠错三种反馈模式

### M2. Tutor Pipeline 调度 ✅
**优先级**：P0

**功能点**：
- 意图识别引擎：识别学习意图（求助、练习、询问进度）
- Agent 调度策略：单 Agent 直接响应，多 Agent 协作
- 上下文共享：多 Agent 协作时共享对话历史
- 管道状态管理：pending / processing / completed

### M3. 协作学习模式 ✅
**优先级**：P1

**功能点**：
- 跨学科问题识别（如数学应用题需要语文理解）
- Agent 间 Handoff（数学 Agent 识别到语言障碍，移交语文 Agent）
- 协作响应合并（多个 Agent 的回答整合）

### M4. 学习会话管理 ✅
**优先级**：P1

**功能点**：
- Session 创建/恢复
- Session 历史记录
- 学习进度追踪
- 会话摘要生成

### M5. 导师个性化 ✅
**优先级**：P2

**功能点**：
- 导师头像和名称
- 导师性格标签（严谨型/活泼型/耐心型）
- 家长可选择开启的导师

---

## 4. 数据模型

### 4.1 Agent 配置
```js
// tutor_agents
{
  id: string,           // 'math' | 'chinese' | 'english' | 'life'
  name: string,        // '数学导师' | '语文导师' | ...
  emoji: string,       // '🔢' | '📝' | '🔤' | '🏠'
  enabled: boolean,     // 家长是否开启
  personality: string,   // 'strict' | 'lively' | 'patient'
  expertise: string[],  // ['计算', '应用题', '几何']
  welcomeMsg: string    // 首次问候语
}
```

### 4.2 Session 会话
```js
// tutor_session
{
  id: string,
  babyId: string,
  agents: string[],     // 参与的 agent id 列表
  messages: [
    {
      id: string,
      role: 'user' | 'math' | 'chinese' | 'english' | 'life' | 'orchestrator',
      content: string,
      timestamp: string,
      actions?: [{ type: string, params: object }]
    }
  ],
  status: 'active' | 'completed',
  createdAt: string,
  updatedAt: string
}
```

### 4.3 学习记录
```js
// learning_record
{
  id: string,
  sessionId: string,
  babyId: string,
  agentId: string,
  topic: string,
  interactionType: 'question' | 'practice' | 'feedback',
  content: string,
  score?: number,       // 1-5 评分
  timestamp: string
}
```

---

## 5. 技术实现

### 5.1 文件结构

```
src/
├── stores/
│   └── aiTutorStore.js         # V36 Multi-Agent Tutor Store
├── services/
│   └── aiTutorService.js       # V36 AI Tutor Pipeline Service
│       ├── OrchestratorAgent    # 协调器
│       ├── MathAgent           # 数学导师
│       ├── ChineseAgent        # 语文导师
│       ├── EnglishAgent        # 英语导师
│       └── LifeAgent           # 生活导师
└── components/
    └── ai-tutor/
        ├── TutorPipeline.vue   # 主管道组件
        ├── AgentAvatar.vue     # Agent头像
        └── SessionCard.vue     # 会话卡片
```

### 5.2 存储结构

```js
// localStorage
'tutor_sessions'       // 学习会话列表
'tutor_agents_config'  // Agent 开关配置
'tutor_current_session' // 当前活跃会话
'tutor_learning_records' // 学习记录
```

### 5.3 依赖现有模块

- `buddyStore.js`：复用心情追踪功能
- `aiRecommendStore.js`：复用对话上下文管理
- `babyStore.js`：获取当前宝宝信息
- `achievementStore.js`：关联学习成就

---

## 6. 现有模块改造

| 模块 | 改造内容 |
|------|----------|
| pages.json | 添加 ai-tutor 页面路由 |
| buddyStore.js | 考虑与 Tutor 并行或整合 |
| App.vue | 注入 Tutor Pipeline 全局状态 |
| theme.js | 添加 Tutor 相关主题变量 |

---

## 7. 验收标准

### M1 — 多 Agent 系统 ✅
- [ ] Orchestrator 可正确识别用户意图
- [ ] MathAgent 可解答数学题目并给出步骤
- [ ] ChineseAgent 可进行拼音、阅读辅导
- [ ] EnglishAgent 可进行单词、口语练习
- [ ] LifeAgent 可提供生活技能指导

### M2 — Pipeline 调度 ✅
- [ ] 单意图请求路由到对应 Agent
- [ ] 跨学科请求触发多 Agent 协作
- [ ] Agent Handoff 正常交接
- [ ] 管道状态准确反映处理阶段

### M3 — 协作学习 ✅
- [ ] Agent 间可共享上下文
- [ ] 协作响应正确合并
- [ ] 家长可查看协作记录

### M4 — 会话管理 ✅
- [ ] 可创建新学习会话
- [ ] 可恢复历史会话
- [ ] 会话数据正确持久化

### M5 — 导师个性化 ✅
- [ ] 家长可开启/关闭特定导师
- [ ] 导师显示对应 emoji 和名称

---

## 8. 优先级与排期

| 模块 | 优先级 | 说明 |
|------|--------|------|
| M1 多 Agent 系统 | P0 | 核心架构 |
| M2 Pipeline 调度 | P0 | 依赖 M1 |
| M3 协作学习 | P1 | 差异化功能 |
| M4 会话管理 | P1 | 数据持久化 |
| M5 导师个性化 | P2 | 锦上添花 |

---

## 9. 风险

- 多 Agent 协作可能增加响应延迟（需要模拟/优化）
- 对话上下文增长可能影响性能（需要限制长度）
- 家长可能对 AI 辅导准确性有疑虑（需明确免责声明）
