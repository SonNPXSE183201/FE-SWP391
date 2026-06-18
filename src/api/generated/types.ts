/**
 * Bridge Type Layer — OpenAPI Schema → Frontend Types
 *
 * This file re-exports convenience type aliases from the auto-generated schema.
 * It is the SINGLE SOURCE OF TRUTH for all API types used across the frontend.
 *
 * Usage:
 *   import type { SeriesDto, TasksDto, ApiResponse } from '@/api/generated/types';
 *
 * DO NOT define manual DTO interfaces for entities that exist in the schema.
 * For frontend-only types (form state, UI state), keep them in feature/types/.
 */
import type { components } from './schema';

// ─── Entity DTOs (Read) ──────────────────────────────────────
export type SeriesDto = components["schemas"]["SeriesDto"];
export type ChapterDto = components["schemas"]["ChapterDto"];
export type PageDto = components["schemas"]["PageDto"];
export type RegionDto = components["schemas"]["RegionDto"];
export type TasksDto = components["schemas"]["TasksDto"];
export type TaskVersionDto = components["schemas"]["TaskVersionDto"];
export type WalletDto = components["schemas"]["WalletDto"];
export type WalletDetailsDto = components["schemas"]["WalletDetailsDto"];
export type TransactionDto = components["schemas"]["TransactionDto"];
export type NotificationDto = components["schemas"]["NotificationDto"];
export type ContractDto = components["schemas"]["ContractDto"];
export type UserResponseDto = components["schemas"]["UserResponseDto"];
export type AuthResponseDto = components["schemas"]["AuthResponseDto"];
export type AssistantResponseDto = components["schemas"]["AssistantResponseDto"];
export type RegisterResponseDto = components["schemas"]["RegisterResponseDto"];
export type ReconciliationReportDto = components["schemas"]["ReconciliationReportDto"];
export type VnpayPaymentResultDto = components["schemas"]["VnpayPaymentResultDto"];
export type LayerDto = components["schemas"]["LayerDto"];

// ─── Raw Entity types (full DB models, for deep includes) ────
export type Series = components["schemas"]["Series"];
export type Chapter = components["schemas"]["Chapter"];
export type Page = components["schemas"]["Page"];
export type Region = components["schemas"]["Region"];
export type Tasks = components["schemas"]["Tasks"];
export type TaskVersion = components["schemas"]["TaskVersion"];
export type Wallet = components["schemas"]["Wallet"];
export type Transaction = components["schemas"]["Transaction"];
export type Notification = components["schemas"]["Notification"];
export type Contract = components["schemas"]["Contract"];
export type ContractAddendum = components["schemas"]["ContractAddendum"];
export type User = components["schemas"]["User"];
export type Role = components["schemas"]["Role"];
export type Annotation = components["schemas"]["Annotation"];
export type BoardVote = components["schemas"]["BoardVote"];
export type RankingRecord = components["schemas"]["RankingRecord"];
export type DisputeLog = components["schemas"]["DisputeLog"];
export type AssistantProfile = components["schemas"]["AssistantProfile"];
export type Report = components["schemas"]["Report"];
export type RefreshToken = components["schemas"]["RefreshToken"];

// ─── Request DTOs (Write) ────────────────────────────────────
export type LoginDto = components["schemas"]["LoginDto"];
export type RegisterDto = components["schemas"]["RegisterDto"];
export type RefreshTokenDto = components["schemas"]["RefreshTokenDto"];
export type ChangePasswordDto = components["schemas"]["ChangePasswordDto"];
export type ForgotPasswordRequestDto = components["schemas"]["ForgotPasswordRequestDto"];
export type ForgotPasswordResetDto = components["schemas"]["ForgotPasswordResetDto"];
export type LogoutDto = components["schemas"]["LogoutDto"];
export type CreateSeriesDto = components["schemas"]["CreateSeriesDto"];
export type CreateTaskDto = components["schemas"]["CreateTaskDto"];
export type CreateContractDto = components["schemas"]["CreateContractDto"];
export type UpdateContractDto = components["schemas"]["UpdateContractDto"];
export type CreateRegionDto = components["schemas"]["CreateRegionDto"];
export type CreateUserByAdminDto = components["schemas"]["CreateUserByAdminDto"];
export type SubmitTaskDto = components["schemas"]["SubmitTaskDto"];
export type SubmitSeriesReviewDto = components["schemas"]["SubmitSeriesReviewDto"];
export type ApproveTaskDto = components["schemas"]["ApproveTaskDto"];
export type ApproveChapterDto = components["schemas"]["ApproveChapterDto"];
export type RejectTaskDto = components["schemas"]["RejectTaskDto"];
export type RejectChapterDto = components["schemas"]["RejectChapterDto"];
export type RequestExtensionDto = components["schemas"]["RequestExtensionDto"];
export type UpdateDeadlineDto = components["schemas"]["UpdateDeadlineDto"];
export type ResolveDisputeDto = components["schemas"]["ResolveDisputeDto"];
export type VoteSeriesRequestDto = components["schemas"]["VoteSeriesRequestDto"];
export type DepositRequestDto = components["schemas"]["DepositRequestDto"];
export type WithdrawRequestDto = components["schemas"]["WithdrawRequestDto"];
export type ApproveWithdrawRequestDto = components["schemas"]["ApproveWithdrawRequestDto"];
export type CreateRankingsDto = components["schemas"]["CreateRankingsDto"];
export type RankingInputDto = components["schemas"]["RankingInputDto"];

// ─── Paged Result Wrappers ───────────────────────────────────
export type TasksDtoPagedResult = components["schemas"]["TasksDtoPagedResult"];
export type UserResponseDtoPagedResult = components["schemas"]["UserResponseDtoPagedResult"];

// ─── Enum-like types ─────────────────────────────────────────
export type UserStatus = components["schemas"]["UserStatus"];

// ─── Generic API Response ────────────────────────────────────
// Matches backend ApiResponse<T> JSON serialization pattern.
// The `success` field is lowercase from System.Text.Json; our axios
// interceptor also normalises it to `IsSuccess` for legacy compat.
export interface ApiResponse<T> {
  success?: boolean;
  IsSuccess?: boolean;        // normalised by axios interceptor
  StatusCode?: number;
  Message?: string | null;
  Data?: T;
  Errors?: Record<string, string[] | null> | null;
}

// ─── Generic Paged Result ────────────────────────────────────
export interface PagedResult<T> {
  Items?: T[] | null;
  PageNumber?: number;
  PageSize?: number;
  TotalItems?: number;
  TotalPages?: number;
  HasPreviousPage?: boolean;
  HasNextPage?: boolean;
}

// ─── Convenience: Paged API Response ─────────────────────────
export type PagedApiResponse<T> = ApiResponse<PagedResult<T>>;
