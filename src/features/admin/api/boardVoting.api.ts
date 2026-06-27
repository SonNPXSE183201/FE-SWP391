import { axiosInstance } from '../../../api/axios';
import type { ApiResponse, SeriesDto } from '../../../api/generated/types';

export type BoardVotingConfigDto = {
  autoResolveHours: number;
  approvalThresholdPercent: number;
  rejectionThresholdPercent: number;
  tiePolicy: 'Reject' | 'Escalate' | 'ChairDecides';
  clearVotesOnResubmit: boolean;
  requireOddBoardSize: boolean;
  boardRoleId: number;
  chairUserId?: number | null;
  chairUserName?: string | null;
};

export type UpdateBoardVotingConfigDto = Omit<BoardVotingConfigDto, 'boardRoleId' | 'chairUserName'>;

export type BoardVotingRulesDto = {
  boardMemberCount: number;
  approveRequired: number;
  rejectRequired: number;
  approvalThresholdPercent: number;
  rejectionThresholdPercent: number;
  tiePolicy: string;
  autoResolveHours: number;
  isEvenBoardSize: boolean;
  requireOddBoardSize: boolean;
  oddBoardSizeWarning?: string | null;
  chairUserId?: number | null;
  chairUserName?: string | null;
  rulesSummary: string;
};

export type ManualResolveBoardVoteDto = {
  approved: boolean;
  reason: string;
  approvedBudget?: number;
};

const unwrap = <T>(body: ApiResponse<T> | undefined): T | undefined =>
  body?.data ?? (body as ApiResponse<T> & { Data?: T })?.Data;

export const boardVotingAdminApi = {
  getConfig: async (): Promise<BoardVotingConfigDto> => {
    const res = await axiosInstance.get<ApiResponse<BoardVotingConfigDto>>('/api/admin/board-voting/config');
    const data = unwrap(res.data);
    if (!data) throw new Error('Không tải được cấu hình biểu quyết');
    return data;
  },

  updateConfig: async (dto: UpdateBoardVotingConfigDto): Promise<BoardVotingConfigDto> => {
    const res = await axiosInstance.put<ApiResponse<BoardVotingConfigDto>>('/api/admin/board-voting/config', dto);
    const data = unwrap(res.data);
    if (!data) throw new Error('Cập nhật cấu hình thất bại');
    return data;
  },

  getRules: async (): Promise<BoardVotingRulesDto> => {
    const res = await axiosInstance.get<ApiResponse<BoardVotingRulesDto>>('/api/admin/board-voting/rules');
    const data = unwrap(res.data);
    if (!data) throw new Error('Không tải được quy tắc biểu quyết');
    return data;
  },

  getEscalated: async (): Promise<SeriesDto[]> => {
    const res = await axiosInstance.get<ApiResponse<SeriesDto[]>>('/api/admin/board-voting/escalated');
    return unwrap(res.data) ?? [];
  },

  manualResolve: async (seriesId: number | string, dto: ManualResolveBoardVoteDto) => {
    const res = await axiosInstance.post<ApiResponse<unknown>>(
      `/api/admin/board-voting/series/${seriesId}/resolve`,
      dto,
    );
    return res.data;
  },
};
