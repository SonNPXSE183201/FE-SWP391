import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { RoleGuard } from './routes/RoleGuard';
import { MainLayout } from './layouts/MainLayout';
import { AuthLayout } from './layouts/AuthLayout';
import { LandingPage } from './pages/landing/LandingPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { LoginPage } from './pages/auth/LoginPage';

// Placeholder — will be replaced with real dashboard pages
const PlaceholderPage = ({ title }: { title: string }) => (
  <div>
    <div className="page-header">
      <h1 className="page-header__title">{title}</h1>
      <p className="page-header__subtitle">Trang này đang được phát triển</p>
    </div>
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '16px',
        marginTop: '16px',
      }}
    >
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '24px',
            minHeight: '140px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            Widget #{i}
          </span>
        </div>
      ))}
    </div>
  </div>
);

// Unauthorized page
const UnauthorizedPage = () => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      gap: '16px',
      textAlign: 'center',
      padding: '20px',
    }}
  >
    <div style={{ fontSize: '72px', lineHeight: 1 }}>🚫</div>
    <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)' }}>
      403 — Không có quyền truy cập
    </h1>
    <p style={{ color: 'var(--text-secondary)', maxWidth: '420px' }}>
      Bạn không có quyền truy cập trang này. Vui lòng liên hệ quản trị viên nếu bạn cho rằng đây là lỗi.
    </p>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1A1A24',
            color: '#F0F0F5',
            border: '1px solid #2E2E3A',
            borderRadius: '8px',
          },
        }}
      />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* Auth routes — wrapped in AuthLayout */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* ─── Mangaka Routes ─── */}
        <Route element={<RoleGuard allowedRoles={['Mangaka']} />}>
          <Route element={<MainLayout />}>
            <Route path="/mangaka" element={<PlaceholderPage title="Dashboard Mangaka" />} />
            <Route path="/mangaka/series" element={<PlaceholderPage title="Series của tôi" />} />
            <Route path="/mangaka/manuscripts" element={<PlaceholderPage title="Quản lý bản thảo" />} />
            <Route path="/mangaka/tasks" element={<PlaceholderPage title="Quản lý Task" />} />
            <Route path="/mangaka/wallet" element={<PlaceholderPage title="Ví tiền" />} />
            <Route path="/mangaka/settings" element={<PlaceholderPage title="Cài đặt" />} />
          </Route>
        </Route>

        {/* ─── Assistant Routes ─── */}
        <Route element={<RoleGuard allowedRoles={['Assistant']} />}>
          <Route element={<MainLayout />}>
            <Route path="/assistant" element={<PlaceholderPage title="Dashboard Trợ lý vẽ" />} />
            <Route path="/assistant/tasks" element={<PlaceholderPage title="Task Queue" />} />
            <Route path="/assistant/portfolio" element={<PlaceholderPage title="Portfolio" />} />
            <Route path="/assistant/profile" element={<PlaceholderPage title="Hồ sơ nghề nghiệp" />} />
            <Route path="/assistant/wallet" element={<PlaceholderPage title="Thu nhập" />} />
            <Route path="/assistant/settings" element={<PlaceholderPage title="Cài đặt" />} />
          </Route>
        </Route>

        {/* ─── Editor Routes ─── */}
        <Route element={<RoleGuard allowedRoles={['Editor']} />}>
          <Route element={<MainLayout />}>
            <Route path="/editor" element={<PlaceholderPage title="Dashboard Biên tập" />} />
            <Route path="/editor/review" element={<PlaceholderPage title="Review bản thảo" />} />
            <Route path="/editor/annotations" element={<PlaceholderPage title="Annotation Tool" />} />
            <Route path="/editor/disputes" element={<PlaceholderPage title="Phân xử tranh chấp" />} />
            <Route path="/editor/settings" element={<PlaceholderPage title="Cài đặt" />} />
          </Route>
        </Route>

        {/* ─── Board Routes ─── */}
        <Route element={<RoleGuard allowedRoles={['Board']} />}>
          <Route element={<MainLayout />}>
            <Route path="/board" element={<PlaceholderPage title="Dashboard Hội đồng BT" />} />
            <Route path="/board/voting" element={<PlaceholderPage title="Bỏ phiếu xét duyệt" />} />
            <Route path="/board/ranking" element={<PlaceholderPage title="Xếp hạng Series" />} />
            <Route path="/board/schedule" element={<PlaceholderPage title="Lịch xuất bản" />} />
            <Route path="/board/settings" element={<PlaceholderPage title="Cài đặt" />} />
          </Route>
        </Route>

        {/* ─── Admin Routes ─── */}
        <Route element={<RoleGuard allowedRoles={['Admin']} />}>
          <Route element={<MainLayout />}>
            <Route path="/admin" element={<PlaceholderPage title="Dashboard Quản trị" />} />
            <Route path="/admin/users" element={<PlaceholderPage title="Quản lý người dùng" />} />
            <Route path="/admin/roles" element={<PlaceholderPage title="Phân quyền RBAC" />} />
            <Route path="/admin/contracts" element={<PlaceholderPage title="Hợp đồng" />} />
            <Route path="/admin/reconciliation" element={<PlaceholderPage title="Đối soát giao dịch" />} />
            <Route path="/admin/settings" element={<PlaceholderPage title="Cài đặt" />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
