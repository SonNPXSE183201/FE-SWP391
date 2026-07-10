// Dashboard feature barrel
export { StatCard } from './components/StatCard';
export { MangakaDashboardFeature } from './components/MangakaDashboardFeature';
export { AssistantDashboardFeature } from './components/AssistantDashboardFeature';
export { AdminDashboardFeature } from './components/AdminDashboardFeature';
export { EditorDashboardFeature } from './components/EditorDashboardFeature';
export { BoardDashboardFeature } from './components/BoardDashboardFeature';

// Hooks
export { useMangakaDashboard, getGreeting } from './hooks/useMangakaDashboard';
export { useAssistantDashboard } from './hooks/useAssistantDashboard';
export { useAdminDashboard } from './hooks/useAdminDashboard';
export { useEditorDashboard } from './hooks/useEditorDashboard';
export { useBoardDashboard } from './hooks/useBoardDashboard';

// API
export { dashboardApi } from './api/dashboard.api';

// Types
export type {
  DashboardStats,
  DashboardActivity,
  DashboardSeriesOverview,
} from './hooks/useMangakaDashboard';
export type {
  AssistantDashboardStats,
  AssistantRecentTask,
} from './hooks/useAssistantDashboard';
export type { AdminDashboardStatsDto, AdminDashboardResponse } from './api/dashboard.api';
export type { EditorDashboardStatsDto, EditorDashboardResponse } from './api/dashboard.api';
export type { BoardDashboardStatsDto, BoardDashboardResponse } from './api/dashboard.api';

