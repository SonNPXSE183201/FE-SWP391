<p align="center">
  <img src="../diagrams/Context Diagram - English.png" alt="Manga Publishing System" width="600"/>
</p>

<h1 align="center">Manga Publishing System — Frontend</h1>

<p align="center">
  <strong>React 18 · TypeScript · Vite · Fabric.js · Zustand · React Query</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white" alt="React"/>
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white" alt="Vite"/>
  <img src="https://img.shields.io/badge/Fabric.js-6-FF6600?logo=javascript&logoColor=white" alt="Fabric.js"/>
  <img src="https://img.shields.io/badge/Zustand-State-433E38?logo=react&logoColor=white" alt="Zustand"/>
  <img src="https://img.shields.io/badge/React_Query-5-FF4154?logo=reactquery&logoColor=white" alt="React Query"/>
  <img src="https://img.shields.io/badge/Tailwind_CSS-3-38B2AC?logo=tailwindcss&logoColor=white" alt="Tailwind CSS"/>
</p>

---

## 📋 Giới thiệu

Frontend cho **Manga Creation Workflows & Publishing Management System** — Giao diện Digital Workspace dành cho 5 vai trò trong hệ thống xuất bản manga: **Admin**, **Editor**, **Board**, **Mangaka**, **Assistant**.

### Tính năng chính
- 🎨 **Canvas Viewer** — Xem trang truyện High-Res với Pan/Zoom (Fabric.js, 624 dòng)
- 🛠️ **Canvas Toolbar** — Thanh công cụ điều khiển Canvas (zoom, pan, tools)
- 📱 **Mobile Canvas Warning** — Cảnh báo xoay ngang trên thiết bị nhỏ
- 💰 **Wallet Dashboard** — 2 ngăn quỹ, lịch sử giao dịch, nạp/rút VNPay
- 📊 **Ranking Dashboard** — Biểu đồ xếp hạng Series theo thời gian
- 🔔 **Real-time Notifications** — SignalR WebSocket (scaffold)
- 🗳️ **Board Voting** — Bỏ phiếu duyệt/hủy Series
- 👤 **Role-based UI** — Mỗi vai trò thấy giao diện khác nhau

## 🎨 Design System

| Thuộc tính | Giá trị |
|-----------|---------|
| **Theme** | Dark Mode (mặc định) |
| **Primary Color** | `#6C5CE7` (Tím manga) |
| **Font chính** | Inter |
| **Font số liệu** | JetBrains Mono |
| **Border Radius** | 8-12px |
| **Spacing** | Bội số 8px |

> Chi tiết: xem [design.md](../design.md)

## 📁 Cấu trúc thư mục

```
src/
├── api/                        # Shared API client
│   └── axios.ts                # Axios instance + JWT interceptors + token refresh
│
├── components/                 # Reusable UI components
│   ├── common/                 # CustomSelect, Logo, PageScaffold, Pagination
│   └── canvas/                 # Fabric.js components
│       ├── CanvasViewer.tsx    #   Pan/Zoom viewer (624 dòng)
│       ├── CanvasToolbar.tsx   #   Thanh công cụ Canvas
│       └── MobileCanvasWarning.tsx  # Cảnh báo xoay ngang
│
├── features/                   # Feature modules (co-located: api + components + hooks + types)
│   ├── admin/                  # Admin tools (api/admin.api.ts, components/)
│   ├── approvals/              # Phê duyệt tài khoản (components/)
│   ├── assistant-profile/      # Profile Assistant (components/)
│   ├── auth/                   # Login, Register (api/, components/, hooks/, types/)
│   ├── canvas/                 # Canvas feature (api/, components/, data/, hooks/)
│   ├── contracts/              # Quản lý hợp đồng (components/)
│   ├── dashboard/              # Role-based dashboards (components/, data/)
│   ├── landing/                # Landing page (components/, hooks/)
│   ├── notifications/          # Notification dropdown
│   ├── ranking/                # Ranking charts
│   ├── review/                 # Review & QC (components/)
│   ├── series/                 # Series management (api/, components/, data/, hooks/, types/)
│   ├── tasks/                  # Task lifecycle (api/, components/, data/)
│   ├── users/                  # User management (components/)
│   └── wallet/                 # Wallet & VNPay (api/, components/, data/, hooks/)
│
├── hooks/                      # Shared custom hooks
│   ├── useAuth.ts              # Auth state access
│   ├── useClickOutside.ts      # Detect click outside element
│   ├── useDebounce.ts          # Debounce values
│   ├── usePagination.ts        # Pagination logic
│   ├── useSignalR.ts           # SignalR real-time connection (scaffold)
│   ├── useWindowSize.ts        # Responsive window size
│   └── index.ts                # Barrel exports
│
├── layouts/                    # Page layouts
│   ├── MainLayout.tsx          # Sidebar + Header + Content
│   ├── AuthLayout.tsx          # Login/Register layout
│   ├── Header.tsx              # Top navigation bar
│   ├── Sidebar.tsx             # Role-based sidebar menu
│   └── index.ts                # Barrel exports
│
├── pages/                      # Route pages (per role)
│   ├── auth/                   # /login, /register
│   ├── landing/                # / (Landing Page)
│   ├── mangaka/                # /mangaka/*
│   ├── assistant/              # /assistant/*
│   ├── editor/                 # /editor/*
│   ├── board/                  # /board/*
│   ├── admin/                  # /admin/*
│   └── wallet/                 # /wallet/deposit-callback (VNPay callback)
│
├── routes/                     # Routing config
│   └── RoleGuard.tsx           # Role-based access guard
│
├── stores/                     # Zustand global stores
│   ├── authStore.ts            # User + JWT token + refresh
│   └── canvasStore.ts          # Canvas tool state
│
├── types/                      # TypeScript definitions
│   ├── entities.ts             # Shared entity interfaces
│   └── index.ts                # Barrel exports
│
├── utils/                      # Utilities
│   └── shadcn.ts               # shadcn/ui utility (cn helper)
│
├── styles/                     # Global CSS
│   ├── variables.css           # CSS custom properties (design tokens)
│   ├── reset.css               # CSS reset
│   └── index.css               # Global styles
│
├── App.tsx                     # Root component + Router
└── main.tsx                    # Entry point
```

## 🗺️ Route Map

### Public
| Route | Page |
|-------|------|
| `/` | Landing Page |
| `/login` | Đăng nhập |
| `/register` | Đăng ký (chỉ Assistant) |

### Mangaka
| Route | Page |
|-------|------|
| `/mangaka` | Dashboard |
| `/mangaka/series` | Quản lý Series |
| `/mangaka/series/:id` | Chi tiết Series |
| `/mangaka/series/:id/chapters` | Chapters trong Series |
| `/mangaka/chapters/:id/pages` | Canvas — Upload & Khoanh vùng |
| `/mangaka/wallet` | Wallet Dashboard |
| `/mangaka/settings` | Settings |

### Assistant
| Route | Page |
|-------|------|
| `/assistant` | Dashboard |
| `/assistant/tasks` | Task Queue |
| `/assistant/tasks/:id` | Chi tiết Task + Upload kết quả |
| `/assistant/wallet` | Wallet + Thu nhập |
| `/assistant/profile` | Profile + SpecialtyTags |
| `/assistant/settings` | Settings |

### Editor
| Route | Page |
|-------|------|
| `/editor` | Dashboard + Progress |
| `/editor/series/:id/review` | Review Chapter + Annotation Tool |
| `/editor/disputes` | Phân xử tranh chấp |
| `/editor/settings` | Settings |

### Board
| Route | Page |
|-------|------|
| `/board` | Dashboard |
| `/board/voting` | Bỏ phiếu duyệt Series |
| `/board/ranking` | Ranking Dashboard + Charts |
| `/board/settings` | Settings |

### Admin
| Route | Page |
|-------|------|
| `/admin` | Dashboard |
| `/admin/users` | Quản lý Users + Approve |
| `/admin/contracts` | Quản lý Hợp đồng (Bao gồm Phụ lục - Addendum) |
| `/admin/reconciliation` | Đối soát VNPay |
| `/admin/settings` | Settings |

## 🖌️ Canvas Components (Fabric.js)

| Component | File | Mô tả | Role |
|-----------|------|--------|------|
| **CanvasViewer** | `CanvasViewer.tsx` (624 dòng) | Xem trang truyện, Pan/Zoom mượt mà | All |
| **CanvasToolbar** | `CanvasToolbar.tsx` | Thanh công cụ: zoom, pan, drawing tools | All |
| **MobileCanvasWarning** | `MobileCanvasWarning.tsx` | Cảnh báo xoay ngang trên mobile/tablet nhỏ | All |

> 📍 Đường dẫn: `src/components/canvas/`

> ⚠️ Canvas chỉ hiển thị trên Desktop/Tablet. Mobile sẽ show `MobileCanvasWarning` cảnh báo xoay ngang.

## 💰 Wallet UI

Hiển thị **2 ngăn quỹ** riêng biệt:

```
┌─────────────────────────────────────────┐
│  💰 Wallet Dashboard                     │
│                                          │
│  ┌──────────────┐  ┌──────────────────┐ │
│  │ 🔵 Quỹ SX    │  │ 🟢 Quỹ khả dụng │ │
│  │ 5,000,000 ₫  │  │ 12,500,000 ₫    │ │
│  └──────────────┘  └──────────────────┘ │
│                                          │
│  🔒 Đang khóa: 2,000,000 ₫              │
│                                          │
│  [Nạp tiền]  [Rút tiền]                 │
│                                          │
│  📋 Lịch sử giao dịch                   │
│  ┌──────┬──────────┬───────────┬──────┐ │
│  │ Loại │ Số tiền  │ Thời gian │ Ref  │ │
│  ├──────┼──────────┼───────────┼──────┤ │
│  │ Lock │ -500,000 │ 01/06     │ T-12 │ │
│  │ ...  │ ...      │ ...       │ ...  │ │
│  └──────┴──────────┴───────────┴──────┘ │
└─────────────────────────────────────────┘
```

## ⚙️ Tech Stack

| Công nghệ | Version | Mục đích |
|-----------|---------|----------|
| React | 18+ | UI Framework |
| TypeScript | 5+ | Type safety |
| Vite | 5+ | Build tool (HMR nhanh) |
| React Router | 6+ | Role-based routing |
| Fabric.js | 6+ | Canvas manipulation |
| Zustand | Latest | Global state (Auth, Canvas) |
| React Query | 5+ | Server state (API caching) |
| Tailwind CSS | 3+ | Styling framework |
| shadcn/ui | Latest | UI Component library |
| Axios | Latest | HTTP Client + JWT Interceptors |
| @microsoft/signalr | Latest | Real-time notifications |
| Jest | Latest | Unit testing |
| React Testing Library | Latest | Component testing |

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) >= 18
- [npm](https://www.npmjs.com/) hoặc [yarn](https://yarnpkg.com/)
- Backend API đang chạy (xem [backend/README.md](../backend/README.md))

### Cài đặt & Chạy

```bash
# 1. Clone repo
git clone <repo-url>
cd frontend

# 2. Install dependencies
npm install

# 3. Tạo file .env.local (nếu cần override)
# Mặc định VITE_API_URL=http://localhost:5010 (API Gateway)
# cp .env.example .env.local

# 4. Chạy dev server
npm run dev

# App: http://localhost:5173
```

### Build Production

```bash
npm run build
npm run preview
```

### Chạy Tests

```bash
npm run test
```

### Environment Variables

| Variable | Mô tả | Default |
|----------|--------|---------|
| `VITE_API_URL` | Backend API Gateway URL | `http://localhost:5010` |

## 📱 Responsive Breakpoints

| Breakpoint | Size | Layout |
|-----------|------|--------|
| Mobile | < 768px | Stack layout, Canvas ẩn |
| Tablet | 768px – 1024px | Sidebar collapse, Canvas basic |
| Desktop | > 1024px | Full layout, Canvas đầy đủ |

## 📖 Tài liệu tham khảo

- [Manga.md](../Manga.md) — Tài liệu tổng quan dự án
- [GEMINI.md](./GEMINI.md) — Frontend coding rules & conventions
- [design.md](../design.md) — Design System (Colors, Typography, Components)
- [Diagrams](../diagrams/) — ERD, Context Diagram, Swimlane Flows

## 👥 Team

| Thành viên | GitHub | Phụ trách |
|-----------|--------|-----------|
| Nguyễn Phạm Xuân Sơn | SonNPXSE183201 | Backend, Infra, DevOps, API Design |
| Phạm Lê Hoàng Phúc | phucplhse183189 | FE Core Logic, Canvas, SignalR, Tasks, Wallet, Admin, API Integration |
| Trần Duy Anh | anht876 | FE Layout, Settings, Dashboards, Data Tables, UI Component Mapping |