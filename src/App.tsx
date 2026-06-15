import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { RoleGuard } from './routes/RoleGuard';
import { MainLayout } from './layouts/MainLayout';
import { AuthLayout } from './layouts/AuthLayout';
import { LandingPage } from './pages/landing/LandingPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { LoginPage } from './pages/auth/LoginPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { DepositCallbackPage } from './pages/wallet/DepositCallbackPage';
//import { UserManagementTable } from './features/user-management/UserManagementTable';

// ─── Mangaka Pages ───
import {
  MangakaDashboardPage,
  SeriesListPage,
  CreateSeriesPage,
  ManuscriptsPage,
  MangakaTasksPage,
  MangakaWalletPage,
  MangakaSettingsPage,
  ChapterDetailPage,
  SeriesDetailPage,
  PageCanvasPage,
} from './pages/mangaka';

// ─── Assistant Pages ───
import {
  AssistantDashboardPage,
  TaskQueuePage,
  PortfolioPage,
  AssistantProfilePage,
  AssistantWalletPage,
  AssistantSettingsPage,
} from './pages/assistant';

// ─── Editor Pages ───
import {
  EditorDashboardPage,
  ReviewPage,
  AnnotationsPage,
  DisputesPage,
  EditorSettingsPage,
  ReviewSeriesPage,
} from './pages/editor';

// ─── Board Pages ───
import {
  BoardDashboardPage,
  VotingPage,
  RankingPage,
  PublishSchedulePage,
  BoardSettingsPage,
  BoardApprovalPage,
} from './pages/board';

// ─── Admin Pages ───
import {
  AdminDashboardPage,
  AdminRolesPage,
  AdminContractsPage,
  AdminReconciliationPage,
  AdminSettingsPage,
} from './pages/admin';

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
        position="top-center"
        toastOptions={{
          className: 'premium-toast',
          style: {
            background: 'var(--bg-secondary, #1A1A24)',
            color: 'var(--text-primary, #F0F0F5)',
            border: '1px solid var(--border-custom, #2E2E3A)',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
            fontSize: '14px',
            fontWeight: 500,
            padding: '16px 20px',
            letterSpacing: '0.2px',
          },
          success: {
            iconTheme: {
              primary: 'var(--success, #10B981)',
              secondary: '#1A1A24',
            },
            style: {
              border: '1px solid rgba(16, 185, 129, 0.3)',
              background: 'linear-gradient(to right, rgba(16, 185, 129, 0.05), var(--bg-secondary, #1A1A24))',
            },
          },
          error: {
            iconTheme: {
              primary: 'var(--danger, #EF4444)',
              secondary: '#1A1A24',
            },
            style: {
              border: '1px solid rgba(239, 68, 68, 0.3)',
              background: 'linear-gradient(to right, rgba(239, 68, 68, 0.05), var(--bg-secondary, #1A1A24))',
            },
          },
        }}
      />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />}
        />
        {/* BẠN CHÈN TẠM DÒNG NÀY VÀO ĐÂY */}
        {/* <Route path="/admin/users" element={<UserManagementTable />} /> */}

        {/* Auth routes — wrapped in AuthLayout */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Route>

        {/* ─── Shared Protected Routes ─── */}
        <Route element={<RoleGuard allowedRoles={['Mangaka', 'Assistant']} />}>
          <Route path="/wallet/deposit/callback" element={<DepositCallbackPage />} />
        </Route>

        {/* ─── Mangaka Routes ─── */}
        <Route element={<RoleGuard allowedRoles={['Mangaka']} />}>
          <Route element={<MainLayout />}>
            <Route path="/mangaka" element={<MangakaDashboardPage />} />
            <Route path="/mangaka/series" element={<SeriesListPage />} />
            <Route path="/mangaka/series/create" element={<CreateSeriesPage />} />
            <Route path="/mangaka/series/:seriesId" element={<SeriesDetailPage />} />
            <Route path="/mangaka/manuscripts" element={<ManuscriptsPage />} />
            <Route path="/mangaka/manuscripts/:chapterId" element={<ChapterDetailPage />} />
            <Route path="/mangaka/tasks" element={<MangakaTasksPage />} />
            <Route path="/mangaka/wallet" element={<MangakaWalletPage />} />
            <Route path="/mangaka/canvas" element={<PageCanvasPage />} />
            <Route path="/mangaka/canvas/:chapterId" element={<PageCanvasPage />} />
            <Route path="/mangaka/settings" element={<MangakaSettingsPage />} />
          </Route>
        </Route>

        {/* ─── Assistant Routes ─── */}
        <Route element={<RoleGuard allowedRoles={['Assistant']} />}>
          <Route element={<MainLayout />}>
            <Route path="/assistant" element={<AssistantDashboardPage />} />
            <Route path="/assistant/tasks" element={<TaskQueuePage />} />
            <Route path="/assistant/portfolio" element={<PortfolioPage />} />
            <Route path="/assistant/profile" element={<AssistantProfilePage />} />
            <Route path="/assistant/wallet" element={<AssistantWalletPage />} />
            <Route path="/assistant/settings" element={<AssistantSettingsPage />} />
          </Route>
        </Route>

        {/* ─── Editor Routes ─── */}
        <Route element={<RoleGuard allowedRoles={['Editor']} />}>
          <Route element={<MainLayout />}>
            <Route path="/editor" element={<EditorDashboardPage />} />
            <Route path="/editor/review" element={<ReviewPage />} />
            <Route path="/editor/review/:seriesId" element={<ReviewSeriesPage />} />
            <Route path="/editor/annotations" element={<AnnotationsPage />} />
            <Route path="/editor/disputes" element={<DisputesPage />} />
            <Route path="/editor/settings" element={<EditorSettingsPage />} />
          </Route>
        </Route>

        {/* ─── Board Routes ─── */}
        <Route element={<RoleGuard allowedRoles={['Board']} />}>
          <Route element={<MainLayout />}>
            <Route path="/board" element={<BoardDashboardPage />} />
            <Route path="/board/approvals" element={<BoardApprovalPage />} />
            <Route path="/board/voting" element={<VotingPage />} />
            <Route path="/board/ranking" element={<RankingPage />} />
            <Route path="/board/schedule" element={<PublishSchedulePage />} />
            <Route path="/board/settings" element={<BoardSettingsPage />} />
          </Route>
        </Route>

        {/* ─── Admin Routes ─── */}
        {/* ─── Admin Routes ─── */}
        <Route element={<RoleGuard allowedRoles={['Admin']} />}>
          <Route element={<MainLayout />}>
            <Route path="/admin" element={<AdminDashboardPage />} />

            {/* Đưa thẳng bảng User mới của bạn vào đây để nó ăn theo khung MainLayout */}
            {/* <Route path="/admin/users" element={<UserManagementTable />} /> */}

            <Route path="/admin/roles" element={<AdminRolesPage />} />
            <Route path="/admin/contracts" element={<AdminContractsPage />} />
            <Route path="/admin/reconciliation" element={<AdminReconciliationPage />} />
            <Route path="/admin/settings" element={<AdminSettingsPage />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;