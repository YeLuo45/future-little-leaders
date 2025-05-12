# 未来小领袖 - 亲子育儿助手

未来小领袖是一款专为家长和孩子设计的任务管理和积分奖励应用。通过游戏化的方式，帮助家长培养孩子的自律能力和责任感，同时增强亲子互动。

## 功能特点

- **宝宝管理**: 支持添加多个宝宝，每个宝宝有独立的积分账户和任务记录
- **任务系统**: 家长可以创建日常、周期和一次性任务，设置任务积分
- **积分商城**: 孩子可以用完成任务获得的积分兑换奖励
- **数据统计**: 直观展示孩子的任务完成情况和积分变化
- **主题切换**: 支持明暗两种主题模式

## 技术栈

- 前端框架: Vue 3 + Uni-App
- 状态管理: Pinia
- 样式: SCSS
- 打包工具: Vite
- 多端支持: H5、微信小程序、支付宝小程序等

## 多端支持

应用支持以下平台:

- 微信小程序
- 支付宝小程序
- 百度小程序
- 头条小程序
- QQ小程序
- 快手小程序
- 飞书小程序
- H5网页版

## 开发指南

### 环境准备

```bash
# 安装依赖
npm install

# 运行H5版本
npm run dev:h5

# 运行微信小程序版本
npm run dev:mp-weixin

# 运行支付宝小程序版本
npm run dev:mp-alipay
```

### 打包发布

```bash
# 打包H5版本
npm run build:h5

# 打包微信小程序版本
npm run build:mp-weixin

# 打包支付宝小程序版本
npm run build:mp-alipay
```

## 目录结构

```
├── src                     # 源代码
│   ├── components          # 公共组件
│   ├── pages               # 页面
│   ├── static              # 静态资源
│   ├── stores              # Pinia 状态管理
│   ├── styles              # 全局样式
│   ├── utils               # 工具类
│   ├── App.vue             # 入口组件
│   ├── main.js             # 入口文件
│   ├── manifest.json       # Uni-App 配置
│   └── pages.json          # 页面路由配置
├── static                  # 公共静态资源
├── package.json            # 项目依赖
└── vite.config.js          # Vite 配置
```

## 贡献指南

1. Fork 项目
2. 创建你的特性分支: `git checkout -b feature/amazing-feature`
3. 提交你的更改: `git commit -m 'Add some amazing feature'`
4. 推送到分支: `git push origin feature/amazing-feature`
5. 提交 Pull Request

## 开源协议

本项目采用 MIT 许可证 