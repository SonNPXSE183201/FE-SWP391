export interface ChapterProductionCheck {
  key: string;
  label: string;
  passed: boolean;
  detail?: string | null;
}

export interface ChapterProductionReadiness {
  chapterId: number;
  status: string;
  canSubmit: boolean;
  totalPages: number;
  pagesReady: number;
  openTaskCount: number;
  checks: ChapterProductionCheck[];
  blockers: string[];
}
