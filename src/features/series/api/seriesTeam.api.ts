import { axiosInstance } from '../../../api/axios';
import type { ApiResponse } from '../../../api/axios';

export interface SeriesAssistantMember {
  seriesId: number;
  assistantId: number;
  assistantName?: string | null;
  assistantEmail?: string | null;
  roleInTeam: string;
  joinedDate?: string | null;
  status: string;
  createAt: string;
}

export interface InviteSeriesAssistantRequest {
  assistantId: number;
  roleInTeam: string;
}

export const seriesTeamApi = {
  getTeam: (seriesId: string) =>
    axiosInstance.get<ApiResponse<SeriesAssistantMember[]>>(`/api/series/${seriesId}/team`),

  getActiveTeam: (seriesId: string) =>
    axiosInstance.get<ApiResponse<SeriesAssistantMember[]>>(`/api/series/${seriesId}/team/active`),

  invite: (seriesId: string, data: InviteSeriesAssistantRequest) =>
    axiosInstance.post<ApiResponse<SeriesAssistantMember>>(`/api/series/${seriesId}/team/invite`, data),

  respond: (seriesId: string, accept: boolean) =>
    axiosInstance.post<ApiResponse<SeriesAssistantMember>>(`/api/series/${seriesId}/team/respond`, { accept }),

  removeMember: (seriesId: string, assistantId: number) =>
    axiosInstance.delete<ApiResponse<null>>(`/api/series/${seriesId}/team/${assistantId}`),
};
