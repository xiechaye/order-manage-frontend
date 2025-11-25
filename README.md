
<div align="center">
  
  <!-- Logo Placeholder: 请替换为实际的 logo 图片路径，例如 ./docs/images/logo.png -->
  <img src="https://ui-avatars.com/api/?name=Gold+Brick&background=f59e0b&color=fff&size=128&rounded=true&font-size=0.33" alt="金砖特价 Logo" width="120" height="120" style="border-radius: 20px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">

  <h1 style="margin-top: 20px;">🧱 金砖特价 (Gold Brick OMS)</h1>
  
  <p align="center">
    <strong>新一代轻量级订单管理与查询系统</strong>
    <br />
    基于 React 19 + TypeScript + Tailwind CSS 打造
  </p>

  <!-- Badges -->
  <p>
    <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-19.2.0-61dafb?style=flat-square&logo=react" alt="React Version"></a>
    <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.x-3178c6?style=flat-square&logo=typescript" alt="TypeScript"></a>
    <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind_CSS-3.x-38bdf8?style=flat-square&logo=tailwindcss" alt="Tailwind CSS"></a>
    <a href="https://axios-http.com/"><img src="https://img.shields.io/badge/Axios-1.x-5a29e4?style=flat-square&logo=axios" alt="Axios"></a>
    <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="License">
  </p>

  <!-- Quick Links -->
  <p>
    <a href="#-快速开始">🚀 快速开始</a> •
    <a href="#-功能特性">✨ 功能特性</a> •
    <a href="#-系统架构">🛠 系统架构</a> •
    <a href="#-项目演示">📸 项目演示</a>
  </p>
</div>

---

## 📖 项目简介 (Introduction)

**金砖特价 (Gold Brick Special Price)** 是一套专为汽车服务或零售行业设计的高效订单管理解决方案。它解决了传统订单管理中“查询难、管理乱、交互差”的痛点。

系统创新性地采用了 **无构建 (No-Build)** 的开发模式，利用现代浏览器的 **Import Maps** 特性直接加载 React 19 和 ESM 模块，极大降低了开发环境的配置复杂度。

**核心价值：**
1.  **公共查询端**：用户可通过车牌号快速检索历史订单与状态，无需登录，极其便利。
2.  **管理后台**：管理员通过安全认证后，可进行全生命周期的订单管理、人员维护及数据统计。

## ✨ 功能特性 (Features)

### 🚗 客户端 (Client Side)
- ✅ **极速查询**：基于车牌号的模糊/精确搜索，秒级返回订单历史。
- ✅ **状态追踪**：清晰展示订单状态（待提货 🟡、已完成 🟢、已取消 🔴）。
- ✅ **响应式设计**：完美适配移动端与桌面端，移动端自动切换为卡片视图。

### 🛡 管理端 (Admin Side)
- ✅ **安全认证**：集成 Sa-Token 规范，支持 JWT 令牌管理、拦截器鉴权及 401 自动登出。
- ✅ **订单全周期管理**：
    - 支持新建、编辑、查看详情。
    - **批量操作**：支持多选订单进行批量删除，操作更高效。
    - **高级筛选**：支持按日期、状态、客户名、车牌号等多维度组合搜索。
- ✅ **人员管理**：
    - 管理员 CRUD（增删改查）。
    - **头像上传**：集成图片上传接口，支持实时预览。
    - 状态控制：一键禁用/启用管理员账号。
- ✅ **交互体验**：内置 Toast 通知、确认弹窗 (Dialog)、侧边栏导航、加载骨架屏。

## 📸 项目演示 (Screenshots)

> 📷 **截图说明**：请将您的项目运行截图放入 `docs/images/` 文件夹，并替换下方的占位链接。

### 1. 首页与查询 (Home & Search)
简洁大气的搜索入口，支持车牌号自动补全与历史记录展示。

| 桌面端首页 | 查询结果页 |
|:---:|:---:|
| <img src="https://via.placeholder.com/600x350/e5e7eb/1f2937?text=Home+Page+Search" alt="Home Page" width="100%"> | <img src="https://via.placeholder.com/600x350/e5e7eb/1f2937?text=Search+Results" alt="Search Results" width="100%"> |

### 2. 订单管理 (Order Management)
核心业务区域，支持复杂筛选与批量操作。

<img src="https://via.placeholder.com/900x400/e5e7eb/1f2937?text=Order+Management+Dashboard+&+Filters" alt="Order Dashboard" width="100%">

### 3. 移动端适配 (Mobile Responsive)
在手机上也能流畅管理业务。

<div align="center">
  <img src="https://via.placeholder.com/300x600/e5e7eb/1f2937?text=Login" width="24%" />
  <img src="https://via.placeholder.com/300x600/e5e7eb/1f2937?text=List+View" width="24%" />
  <img src="https://via.placeholder.com/300x600/e5e7eb/1f2937?text=Mobile+Menu" width="24%" />
</div>

## 🚀 快速开始 (Quick Start)

本项目依赖后端 API 服务，请确保后端服务已启动。

### 前置要求
- Node.js (仅用于运行静态服务器，如 `http-server`)
- 现代浏览器 (Chrome/Edge/Firefox) 支持 ES Modules

### 安装与运行

由于本项目采用 Import Map + ESM 方式，无需复杂的 `npm install` 构建过程即可开发。

1. **克隆仓库**
   ```bash
   git clone https://github.com/your-username/gold-brick-oms.git
   cd gold-brick-oms
   ```

2. **启动本地服务器**
   你需要一个静态文件服务器来运行项目（因为浏览器不直接支持本地文件系统的 ESM 导入）。
   
   使用 `npx` (无需安装):
   ```bash
   npx http-server . -p 3000
   ```
   或者使用 VS Code 的 **Live Server** 插件。

3. **访问项目**
   打开浏览器访问 `http://localhost:3000`。

### 后端接口配置
打开 `services/api.ts` 文件，根据实际后端地址修改 `BASE_URL`：

```typescript
// services/api.ts
const BASE_URL = 'http://localhost:8080/api'; // 修改为你的后端地址
```

## 📂 目录结构 (Directory Structure)

```text
gold-brick-oms/
├── index.html              # 入口 HTML (包含 Import Maps 和 Tailwind 配置)
├── index.tsx               # React 挂载入口
├── App.tsx                 # 主应用逻辑与路由分发
├── metadata.json           # 项目元数据配置
├── types.ts                # TypeScript 类型定义 (Models/Interfaces)
├── services/
│   └── api.ts              # Axios 封装与 API 请求层 (拦截器配置)
├── components/             # 组件目录
│   ├── Layout.tsx          # 整体布局 (侧边栏、Header)
│   ├── HomePage.tsx        # 首页 (车牌查询)
│   ├── LoginPage.tsx       # 登录页
│   ├── OrderManager.tsx    # 订单管理列表 (核心业务)
│   ├── OrderModal.tsx      # 订单 新增/编辑/详情 弹窗
│   ├── AdminManager.tsx    # 管理员管理
│   ├── AdminModal.tsx      # 管理员 新增/编辑 弹窗 (含头像上传)
│   ├── ConfirmDialog.tsx   # 通用确认对话框
│   └── AdvancedSearchDrawer.tsx # 高级搜索抽屉
└── docs/
    └── images/             # 文档图片资源
```
