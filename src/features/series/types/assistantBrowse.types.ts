export interface AssistantBrowseItem {
  id: number;
  fullName: string;
  email?: string;
  penName?: string | null;
  portfolioUrl?: string | null;
  avatarUrl?: string | null;
  specialtyTags?: string | null;
  onTimeRate?: number;
  averageRating?: number;
  totalCompletedTasks?: number;
  currentActiveTasks?: number;
  disputeRate?: number;
}

export interface RoleFitBadge {
  score: number;
  label: string;
  description: string;
  toneClass: string;
}

export interface PerformanceBadge {
  label: string;
  description: string;
  toneClass: string;
  isTopPick: boolean;
}
