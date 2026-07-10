import { axiosInstance } from '../../../api/axios';
import type { ApiResponse } from '../../../api/axios';
import type {
  SeriesAssistantDto,
  InviteSeriesAssistantDto,
} from '../../../api/generated/types';

export type { SeriesAssistantDto, InviteSeriesAssistantDto };

export const seriesTeamApi = {
  getTeam: (seriesId: string) =>
    axiosInstance.get<ApiResponse<SeriesAssistantDto[]>>(`/api/series/${seriesId}/team`),

  getActiveTeam: (seriesId: string) =>
    axiosInstance.get<ApiResponse<SeriesAssistantDto[]>>(`/api/series/${seriesId}/team/active`),

  invite: (seriesId: string, data: InviteSeriesAssistantDto) =>
    axiosInstance.post<ApiResponse<SeriesAssistantDto>>(`/api/series/${seriesId}/team/invite`, data),

  respond: (seriesId: string, accept: boolean) =>
    axiosInstance.post<ApiResponse<SeriesAssistantDto>>(`/api/series/${seriesId}/team/respond`, { accept }),

  removeMember: (seriesId: string, assistantId: number, roleToRemove?: string) =>
    axiosInstance.delete<ApiResponse<null>>(`/api/series/${seriesId}/team/${assistantId}`, {
      params: roleToRemove ? { roleToRemove } : undefined,
    }),
};
