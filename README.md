<div align="center">
  
  <!-- Logo Placeholder -->
  <img src="https://via.placeholder.com/150/f59e0b/ffffff?text=Gold+Brick" alt="金砖特价 Logo" width="120" height="120" style="border-radius: 20px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">

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
    <img src="https://img.shields.io/badge/Build-Passing-success?style=flat-square" alt="Build Status">
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

系统分为两大部分：
1.  **公共查询端**：用户可通过车牌号快速检索历史订单与状态，无需登录，极其便利。
2.  **管理后台**：管理员通过安全认证后，可进行全生命周期的订单管理、人员维护及数据统计。

项目前端采用无构建步骤的 **ESM (ES Modules)** 架构设计（也可轻松迁移至 Vite），结合 **React 19** 的最新特性，实现了极速的首屏加载与流畅的用户体验。

## ✨ 功能特性 (Features)

### 🚗 客户端 (Client Side)
- ✅ **极速查询**：基于车牌号的模糊/精确搜索，秒级返回订单历史。
- ✅ **状态追踪**：清晰展示订单状态（待提货 🟡、已完成 🟢、已取消 🔴）。
- ✅ **响应式设计**：完美适配移动端与桌面端，移动端自动切换为卡片视图。

### 🛡 管理端 (Admin Side)
- ✅ **安全认证**：JWT/Sa-Token 令牌管理，支持自动过期处理与拦截。
- ✅ **订单全周期管理**：
    - 支持新建、编辑、查看详情。
    - **批量操作**：支持多选订单进行批量删除。
    - **高级筛选**：支持按日期、状态、客户名、车牌号等多维度组合搜索。
- ✅ **人员管理**：
    - 管理员 CRUD（增删改查）。
    - **头像上传**：集成图片上传接口，支持实时预览。
    - 状态控制：一键禁用/启用管理员账号。
- ✅ **交互体验**：内置 Toast 通知、确认弹窗（Dialog）、侧边栏导航、加载骨架屏。

## 📸 项目演示 (Screenshots)

> **提示**：以下截图为演示占位符，请在项目运行后截图替换。

### 1. 首页与查询 (Home & Search)
简洁大气的搜索入口，支持车牌号自动补全与历史记录展示。

| 桌面端首页 | 查询结果页 |
|:---:|:---:|
| ![Home Desktop](https://via.placeholder.com/600x350/e5e7eb/1f2937?text=Home+Page+Search) | ![Search Results](https://via.placeholder.com/600x350/e5e7eb/1f2937?text=Search+Results+Card) |

### 2. 订单管理 (Order Management)
核心业务区域，支持复杂筛选与批量操作。

![Order Dashboard](https://via.placeholder.com/900x400/e5e7eb/1f2937?text=Order+Management+Dashboard+&+Filters)

### 3. 移动端适配 (Mobile Responsive)
在手机上也能流畅管理业务。

<div align="center">
  <img src="https://via.placeholder.com/300x600/e5e7eb/1f2937?text=Mobile+Login" width="24%" />
  <img src="https://via.placeholder.com/300x600/e5e7eb/1f2937?text=Mobile+List" width="24%" />
  <img src="https://via.placeholder.com/300x600/e5e7eb/1f2937?text=Mobile+Menu" width="24%" />
</div>

## 🚀 快速开始 (Quick Start)

本项目依赖后端 API 服务，请确保后端服务已在 `http://localhost:8080` 启动（或修改配置）。

### 前置要求
- Node.js > 18.0 (推荐使用 `http-server` 或 `live-server` 运行)
- 现代浏览器 (Chrome/Edge/Firefox) 支持 ES Modules

### 安装与运行

由于本项目采用 Import Map + ESM 方式，无需复杂的 `npm install` 构建过程即可开发。

1. **克隆仓库**
   ```bash
   git clone https://github.com/your-username/gold-brick-oms.git
   cd gold-brick-oms
