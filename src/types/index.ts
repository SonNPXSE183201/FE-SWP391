// ============================================================
// Global TypeScript Types — Manga Publishing Platform
// ============================================================

// Re-export all domain types from a single entry point
export type { UserRole, User } from '../stores/authStore';
export type {
  // Enums
  SeriesStatus,
  ChapterStatus,
  TaskStatus,
  TransactionType,
  AnnotationType,
  DisputeResolution,
  VoteType,
  PageStatus,
  UserAccountStatus,
  // Entities
  Series,
  Chapter,
  Page,
  Region,
  Task,
  TaskVersion,
  Annotation,
  Wallet,
  Transaction,
  Contract,
  ContractAddendum,
  AssistantProfile,
  BoardVote,
  RankingVote,
  Notification,
  DisputeLog,
  // API Response
  ApiResponse,
  PaginatedResponse,
} from './entities';
