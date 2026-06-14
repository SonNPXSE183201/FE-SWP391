// Dashboard feature barrel
export { StatCard } from './components/StatCard';
export { MangakaDashboardFeature } from './components/MangakaDashboardFeature';
export { AssistantDashboardFeature } from './components/AssistantDashboardFeature';

// Hooks
export { useMangakaDashboard, getGreeting } from './hooks/useMangakaDashboard';
export { useAssistantDashboard } from './hooks/useAssistantDashboard';

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
