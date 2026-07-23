import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './components/common/ToastProvider';
import { AnimationProvider } from './components/common/animation';
import { RoleGuard } from './routes/RoleGuard';
import { MainLayout } from './layouts/MainLayout';
import { AuthLayout } from './layouts/AuthLayout';
import { LandingPage } from './pages/landing/LandingPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { LoginPage } from './pages/auth/LoginPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { DepositCallbackPage } from './pages/wallet/DepositCallbackPage';

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
  MangakaAssistantsPage,
  MangakaRankingPage,
} from './pages/mangaka';

// ─── Assistant Pages ───
import {
  AssistantDashboardPage,
  TaskQueuePage,
  PortfolioPage,
  AssistantProfilePage,
  AssistantWalletPage,
  AssistantSettingsPage,
  SeriesInviteRespondPage,
  AssistantInvitesPage,
} from './pages/assistant';

// ─── Editor Pages ───
import {
  EditorDashboardPage,
  ChapterReviewPage,
  SeriesReviewQueuePage,
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
  RankingDataEntryPage,
  PublishSchedulePage,
  BoardSettingsPage,
} from './pages/board';

// ─── Admin Pages ───
import {
  AdminDashboardPage,
  AdminUsersPage,
  AdminContractsPage,
  AdminReconciliationPage,
  AdminWithdrawApprovalPage,
  AdminSettingsPage,
  AdminBoardVotingPage,
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
      <AnimationProvider>
        <ToastProvider />
        <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* Auth routes — wrapped in AuthLayout */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Route>

        {/* VNPay redirect — không yêu cầu đăng nhập (user quay về từ cổng thanh toán ngoài) */}
        <Route path="/wallet/deposit/callback" element={<DepositCallbackPage />} />

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
            <Route path="/mangaka/assistants" element={<MangakaAssistantsPage />} />
            <Route path="/mangaka/wallet" element={<MangakaWalletPage />} />
            <Route path="/mangaka/canvas" element={<PageCanvasPage />} />
            <Route path="/mangaka/canvas/:chapterId" element={<PageCanvasPage />} />
            <Route path="/mangaka/settings" element={<MangakaSettingsPage />} />
            <Route path="/mangaka/ranking" element={<MangakaRankingPage />} />
          </Route>
        </Route>

        {/* ─── Assistant Routes ─── */}
        <Route element={<RoleGuard allowedRoles={['Assistant']} />}>
          <Route element={<MainLayout />}>
            <Route path="/assistant" element={<AssistantDashboardPage />} />
            <Route path="/assistant/tasks" element={<TaskQueuePage />} />
            <Route path="/assistant/invites" element={<AssistantInvitesPage />} />
            <Route path="/assistant/series-invites/:seriesId" element={<SeriesInviteRespondPage />} />
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
            <Route path="/editor/series-review" element={<SeriesReviewQueuePage />} />
            <Route path="/editor/chapter-review" element={<ChapterReviewPage />} />
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
            <Route path="/board/voting" element={<VotingPage />} />
            <Route path="/board/ranking" element={<RankingPage />} />
            <Route path="/board/ranking-data" element={<RankingDataEntryPage />} />
            <Route path="/board/schedule" element={<PublishSchedulePage />} />
            <Route path="/board/settings" element={<BoardSettingsPage />} />
          </Route>
        </Route>

        {/* ─── Admin Routes ─── */}
        <Route element={<RoleGuard allowedRoles={['Admin']} />}>
          <Route element={<MainLayout />}>
            <Route path="/admin" element={<AdminDashboardPage />} />

            <Route path="/admin/users" element={<AdminUsersPage />} />

            <Route path="/admin/contracts" element={<AdminContractsPage />} />
            <Route path="/admin/reconciliation" element={<AdminReconciliationPage />} />
            <Route path="/admin/withdraw-approval" element={<AdminWithdrawApprovalPage />} />
            <Route path="/admin/board-voting" element={<AdminBoardVotingPage />} />
            <Route path="/admin/settings" element={<AdminSettingsPage />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimationProvider>
    </BrowserRouter>
  );
}

export default App;