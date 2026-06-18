// ============================================================
// Global TypeScript Types — Manga Publishing Platform
// ============================================================
//
// This barrel re-exports types from two sources:
// 1. OpenAPI generated bridge types (source of truth for API DTOs)
// 2. Legacy entities.ts (deprecated — used by mock data & some components)
//
// New code should import directly from '../api/generated/types' when possible.
// ============================================================

// Re-export auth store types
export type { UserRole, User } from '../stores/authStore';

// Re-export OpenAPI bridge types (preferred)
export type {
  // API Response wrappers
  ApiResponse,
  PagedResult,
  PagedApiResponse,
  // Entity DTOs
  SeriesDto,
  ChapterDto,
  PageDto,
  RegionDto,
  TasksDto,
  TaskVersionDto,
  WalletDto,
  WalletDetailsDto,
  TransactionDto,
  NotificationDto,
  ContractDto,
  UserResponseDto,
  AuthResponseDto,
  AssistantResponseDto,
  RegisterResponseDto,
  ReconciliationReportDto,
  // Request DTOs
  CreateSeriesDto,
  CreateTaskDto,
  CreateContractDto,
  CreateRegionDto,
  SubmitTaskDto,
  ResolveDisputeDto,
  VoteSeriesRequestDto,
  DepositRequestDto,
  WithdrawRequestDto,
} from '../api/generated/types';

// Re-export legacy entity types (deprecated — for backward compat with mock data)
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
  // Legacy entities (camelCase, string IDs)
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
  // Legacy API wrappers
  PaginatedResponse,
} from './entities';
