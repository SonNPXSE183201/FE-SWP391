# Frontend Rules — Manga Publishing System

> React 18+ · TypeScript 5+ · Vite 5+ · Fabric.js · Zustand · React Query

## 1. Tech Stack

| Công nghệ | Version | Mục đích |
|-----------|---------|----------|
| React | 18+ | UI Framework |
| TypeScript | 5+ | Type safety |
| Vite | 5+ | Build tool (HMR nhanh) |
| React Router | 6+ | Role-based routing & Nested layouts |
| Fabric.js | 6+ | Canvas manipulation (vẽ, khoanh vùng, annotation) |
| Zustand | Latest | Global state management |
| Axios | Latest | HTTP Client + JWT Interceptors |
| React Query (TanStack) | 5+ | Server state (caching, optimistic updates) |
| Tailwind CSS | 3+ | Styling framework |
| shadcn/ui | Latest | UI Component library |

## 2. Cấu trúc thư mục

```
src/
├── api/
│   └── axios.ts                        # Axios instance + JWT interceptors + gateway rewrite
├── components/
│   ├── canvas/                         # Fabric.js Canvas components (dùng chung)
│   │   ├── CanvasViewer.tsx            # 624 lines — Pan/Zoom/Draw/Annotate (Fabric.js 6)
│   │   ├── CanvasToolbar.tsx           # Tool selection, zoom controls, delete
│   │   └── MobileCanvasWarning.tsx     # Responsive warning (yêu cầu Desktop/Tablet)
│   └── common/                         # Shared UI components
│       ├── CustomSelect.tsx
│       ├── Logo.tsx
│       ├── PageScaffold.tsx            # Page wrapper (title, breadcrumb, actions)
│       └── Pagination.tsx
├── features/                           # Feature-Driven Architecture
│   ├── admin/
│   │   └── api/admin.api.ts
│   ├── approvals/
│   │   └── components/BoardApprovalFeature.tsx
│   ├── assistant-profile/
│   │   └── components/AssistantProfileFeature.tsx
│   ├── auth/
│   │   ├── api/auth.api.ts
│   │   ├── components/                 # LoginForm, RegisterForm, ForgotPasswordForm,
│   │   │                               # ResetPasswordForm, ChangePasswordModal, ...
│   │   ├── hooks/useAuthForm.ts
│   │   └── types/auth.types.ts
│   ├── canvas/
│   │   ├── api/canvas.api.ts
│   │   ├── components/                 # PageCanvasFeature, AnnotationReviewFeature
│   │   ├── data/mockData.ts
│   │   └── hooks/useCanvasData.ts
│   ├── contracts/
│   │   └── components/ContractManagementFeature.tsx
│   ├── dashboard/
│   │   ├── components/                 # MangakaDashboardFeature, AssistantDashboardFeature, StatCard
│   │   └── data/mockData.ts
│   ├── landing/
│   │   └── components/                 # HeroSection, FeaturesSection, Navbar, Footer, ... (11 files)
│   ├── notifications/                  # Placeholder (index.ts only)
│   ├── ranking/                        # Placeholder (index.ts only)
│   ├── review/
│   │   └── components/ReviewSeriesFeature.tsx
│   ├── series/                         # Bao gồm cả Chapters & Manuscripts
│   │   ├── api/series.api.ts
│   │   ├── components/                 # SeriesListFeature, SeriesDetailFeature, CreateSeriesForm,
│   │   │                               # ManuscriptsFeature, ChapterDetailFeature, ...
│   │   ├── data/                       # mockData.ts, mockPages.ts
│   │   └── hooks/useSeries.ts
│   ├── tasks/
│   │   ├── api/task.api.ts
│   │   ├── components/                 # MangakaTasksFeature, TaskQueueFeature, CreateTaskModal
│   │   └── data/mockData.ts
│   ├── users/
│   │   └── components/UserManagementFeature.tsx
│   └── wallet/
│       ├── api/wallet.api.ts
│       ├── components/                 # MangakaWalletFeature, AssistantWalletFeature,
│       │                               # WalletActionModal, TransactionDetailModal, DepositCallbackFeature
│       ├── data/mockData.ts
│       └── hooks/                      # useWallet.ts, useWalletActions.ts,
│                                       # useWalletSignalR.ts, useDepositCallback.ts
├── hooks/                              # Shared custom hooks
│   ├── useAuth.ts
│   ├── useSignalR.ts                   # Scaffold only
│   ├── usePagination.ts
│   ├── useClickOutside.ts
│   ├── useDebounce.ts
│   └── useWindowSize.ts
├── layouts/                            # Page layouts
│   ├── MainLayout.tsx
│   ├── AuthLayout.tsx
│   ├── Header.tsx
│   └── Sidebar.tsx
├── pages/                              # Route pages (organized by role)
│   ├── admin/
│   ├── assistant/
│   ├── auth/
│   ├── board/
│   ├── editor/
│   ├── landing/
│   ├── mangaka/
│   └── wallet/
├── routes/
│   └── RoleGuard.tsx
├── stores/                             # Zustand stores
│   ├── authStore.ts
│   └── canvasStore.ts
├── types/                              # TypeScript type definitions
│   ├── entities.ts                     # 261 lines — Tất cả interfaces & types tập trung
│   └── index.ts                        # Re-exports
├── utils/
│   └── shadcn.ts                       # shadcn/ui utility (cn helper)
├── styles/
│   ├── index.css
│   ├── variables.css
│   └── reset.css
├── App.tsx
└── main.tsx
```

## 3. Coding Conventions

### 3.1 Component Rules
- **Functional components ONLY** — Không dùng class components.
- **Named exports** — Không dùng default export cho components.
- File naming: `PascalCase.tsx` cho components, `camelCase.ts` cho utils/hooks.
- Một component chính per file.

```tsx
// ✅ Good
export const TaskCard = ({ task, onApprove }: TaskCardProps) => {
  return <div>...</div>;
};

// ❌ Bad
export default function TaskCard() { ... }
```

### 3.2 TypeScript
- **Strict mode enabled** — `strict: true` trong `tsconfig.json`.
- Dùng `interface` cho object shapes, `type` cho unions/intersections.
- **KHÔNG** dùng `any` — dùng `unknown` nếu cần.
- Props interface naming: `{ComponentName}Props`.

```tsx
interface TaskCardProps {
  task: Task;
  onApprove: (taskId: string) => void;
  onRevision: (taskId: string, annotations: Annotation[]) => void;
}

type UserRole = 'Admin' | 'Editor' | 'Mangaka' | 'Assistant' | 'Board';
type TaskStatus = 'Pending' | 'In_Progress' | 'Revision' | 'Approved' | 'Cancelled' | 'Disputed' | 'Closed';
```

### 3.3 State Management

| Loại state | Công cụ | Ví dụ |
|-----------|---------|-------|
| Global app state | **Zustand** | Auth, UI settings, canvas state |
| Server state | **React Query** | API data fetching, caching, mutations |
| Local component state | **useState/useReducer** | Form inputs, toggle, modals |

- **KHÔNG** lưu server data trong Zustand — dùng React Query.

```tsx
// stores/authStore.ts
import { create } from 'zustand';

interface AuthStore {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  setAuth: (user, token) => set({ user, token }),
  logout: () => set({ user: null, token: null }),
}));
```

### 3.4 API Layer

```tsx
// api/axios.ts
import axios from 'axios';

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// JWT Refresh Token interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Refresh token logic...
    }
    return Promise.reject(error);
  },
);
```

```tsx
// api/tasks.api.ts
export const tasksApi = {
  getMyTasks: () => axiosInstance.get<ApiResponse<Task[]>>('/api/tasks'),
  createTask: (data: CreateTaskRequest) =>
    axiosInstance.post<ApiResponse<Task>>('/api/tasks', data),
  approveTask: (taskId: string) =>
    axiosInstance.put<ApiResponse<Task>>(`/api/tasks/${taskId}/approve`),
};

// hooks/useTasks.ts
export const useTasks = () => {
  return useQuery({
    queryKey: ['tasks'],
    queryFn: () => tasksApi.getMyTasks().then(res => res.data.data),
  });
};

export const useApproveTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: tasksApi.approveTask,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });
};
```

### 3.5 API Data Mapping (PascalCase vs camelCase)

**RẤT QUAN TRỌNG:** Backend C# (ASP.NET) thường trả về JSON với các thuộc tính dạng **PascalCase** (Ví dụ: `IsSuccess`, `Data`, `SetupFundBalance`). Trong khi Frontend (TypeScript) quy ước sử dụng **camelCase** (Ví dụ: `isSuccess`, `data`, `setupFundBalance`).
- **KHÔNG** sử dụng trực tiếp dữ liệu PascalCase từ API truyền xuống Components.
- **BẮT BUỘC** phải thực hiện **Data Mapping** từ `PascalCase` sang `camelCase` ngay tại tầng API hook (trong `queryFn` của React Query) trước khi return dữ liệu cho component.
- Phải định nghĩa interface `ApiResponse` khớp với response format của backend (Sử dụng PascalCase cho các key root nếu backend cấu hình như vậy).

**Ví dụ:**
```tsx
export const useWallet = () => {
  return useQuery({
    queryKey: ['wallet'],
    queryFn: async () => {
      const response = await walletApi.getMyWallet();
      
      // 1. Nhận dữ liệu PascalCase từ backend
      const backendData = response.data.Data; 
      
      // 2. Map sang camelCase theo Entity của Frontend
      const wallet: Wallet = {
        id: String(backendData.Id),
        setupFundBalance: Number(backendData.SetupFundBalance),
        withdrawableBalance: Number(backendData.WithdrawableBalance),
        // ...
      };

      return wallet;
    }
  });
};
```

## 4. Routing & Authorization

### 4.1 Role-based Guard

```tsx
// routes/RoleGuard.tsx
interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

export const RoleGuard = ({ allowedRoles, children }: RoleGuardProps) => {
  const { user } = useAuthStore();
  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }
  return <>{children}</>;
};
```

### 4.2 Route Map

```
/                              → Landing Page (Public)
/login                         → Login
/register                      → Register (Assistant only)
/mangaka/                      → Mangaka Dashboard
/mangaka/series                → Series Management
/mangaka/series/:id            → Series Detail
/mangaka/series/:id/chapters   → Chapters of Series
/mangaka/chapters/:id/pages    → Page Editor (Canvas)
/mangaka/wallet                → Wallet Dashboard
/mangaka/settings              → Settings
/assistant/                    → Assistant Dashboard
/assistant/tasks               → Task Queue
/assistant/tasks/:id           → Task Detail + Upload
/assistant/wallet              → Wallet
/assistant/profile             → Profile + SpecialtyTags
/assistant/settings            → Settings
/editor/                       → Editor Dashboard
/editor/series/:id/review      → Chapter Review + Annotation
/editor/disputes               → Dispute Resolution
/editor/settings               → Settings
/board/                        → Board Dashboard
/board/voting                  → Series Voting
/board/ranking                 → Ranking Dashboard
/board/settings                → Settings
/admin/                        → Admin Dashboard
/admin/users                   → User Management
/admin/contracts               → Contract Management (Bao gồm Phụ lục - Addendum)
/admin/reconciliation          → VNPay Reconciliation
/admin/settings                → Settings
```

## 5. Canvas & Fabric.js

### 5.1 Components chính
| Component | Mô tả | Dùng bởi |
|-----------|--------|----------|
| `CanvasViewer` | View trang truyện, Pan/Zoom | All roles |
| `RegionSelector` | Khoanh vùng trên trang → JSON {x, y, w, h} | Mangaka |
| `AnnotationTool` | Ghim lỗi lên trang (Technical/Art/Content) | Editor, Mangaka |
| `LayerCompositor` | Tinh chỉnh Z-Index layers | Mangaka |

### 5.2 Canvas State
- Quản lý bằng Zustand store riêng: `canvasStore`.
- Tọa độ Region: `{ x: number, y: number, width: number, height: number }`.
- Z-Index cho layer ordering.

### 5.3 Performance
- **Lazy load** canvas components — `React.lazy()`.
- Không render canvas trên mobile → show alert "Vui lòng dùng Desktop/Tablet".
- Throttle/debounce Pan/Zoom events.
- Sử dụng `OffscreenCanvas` nếu browser hỗ trợ.

## 6. Real-time — SignalR Client

```tsx
// hooks/useSignalR.ts
import { HubConnectionBuilder, HubConnection } from '@microsoft/signalr';

export const useSignalR = () => {
  const { token } = useAuthStore();
  const [connection, setConnection] = useState<HubConnection | null>(null);

  useEffect(() => {
    const conn = new HubConnectionBuilder()
      .withUrl(`${API_URL}/hubs/notification`, {
        accessTokenFactory: () => token ?? '',
      })
      .withAutomaticReconnect()
      .build();

    conn.start();
    setConnection(conn);
    return () => { conn.stop(); };
  }, [token]);

  return connection;
};
```

- Events lắng nghe:
  - `TaskStatusChanged` — Cập nhật task list
  - `NewNotification` — Badge thông báo
  - `WalletUpdated` — Refresh số dư
  - `ChapterApproved` — Thông báo nhuận bút

## 7. Wallet UI

- Hiển thị **2 ngăn quỹ riêng biệt** với badge màu khác nhau:
  - `SetupFundBalance` — Badge xanh dương (Quỹ sản xuất)
  - `WithdrawableBalance` — Badge xanh lá (Quỹ khả dụng)
- Lịch sử giao dịch: Filter theo Type, sắp xếp theo ngày.
- Format tiền: VNĐ, dùng `Intl.NumberFormat('vi-VN')`.
- Real-time cập nhật số dư qua SignalR.

```tsx
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};
```

## 8. Error Handling

- **ErrorBoundary** component wrap toàn app.
- Axios interceptor: `401` → redirect `/login`, `403` → redirect `/unauthorized`.
- **Toast notifications** cho user-facing errors (dùng react-hot-toast hoặc sonner).
- Console logging cho debug.

## 9. Testing

- Framework: **Jest** + **React Testing Library**.
- Test files: `{ComponentName}.test.tsx` cạnh component.
- Test bắt buộc:
  - Role guards.
  - Wallet calculations (format currency, display logic).
  - Critical flows: Login, Task creation, Payment flow.

## 10. Performance Optimization

- `React.lazy()` cho route-level code splitting.
- `React.memo()` cho expensive renders (Canvas, Charts).
- `useMemo` / `useCallback` cho computed values.
- Image: WebP format, lazy loading (`loading="lazy"`).
- Virtual scrolling cho long lists (Task queue, Transactions) — `react-window` hoặc `tanstack-virtual`.

## 11. Responsive Design

| Breakpoint | Size | Mô tả |
|-----------|------|-------|
| Mobile | < 768px | Stack layout, Canvas ẩn + alert xoay ngang |
| Tablet | 768px – 1024px | Canvas basic, sidebar collapse |
| Desktop | > 1024px | Full layout, Canvas đầy đủ |

- Mobile-first approach.
- Canvas components: Desktop/Tablet only.
- Dashboard: Stack columns trên mobile.

## 12. Design System

- Xem file `design.md` tại root project cho Color Palette, Typography, Component Styles.
- CSS Variables cho design tokens (colors, spacing, typography).
- Sử dụng Tailwind CSS v3 kết hợp với shadcn/ui để xây dựng components nhanh chóng và nhất quán.
