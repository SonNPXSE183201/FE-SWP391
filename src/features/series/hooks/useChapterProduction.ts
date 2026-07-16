import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { seriesApi } from '../api/series.api';
import { isApiSuccess, getAxiosErrorMessage } from '../../../api/apiResponse';
import type { ApiResponse } from '../../../api/generated/types';
import type { ChapterProductionReadiness } from '../types/chapterProduction';
import { isChapterSubmittableStatus } from '../../../utils/status';

export { isChapterSubmittableStatus };

const mapReadiness = (raw: Record<string, unknown>): ChapterProductionReadiness => {
  const translateText = (text: string) => {
    if (!text) return text;
    return text
      .replace(/Assistant/g, 'Trợ lý')
      .replace(/task/gi, 'công việc')
      .replace(/Canvas/g, 'Khung vẽ')
      .replace(/Editor/g, 'Biên tập viên');
  };

  return {
    chapterId: Number(raw.chapterId ?? raw.ChapterId ?? 0),
    status: String(raw.status ?? raw.Status ?? ''),
    canSubmit: Boolean(raw.canSubmit ?? raw.CanSubmit),
    totalPages: Number(raw.totalPages ?? raw.TotalPages ?? 0),
    pagesReady: Number(raw.pagesReady ?? raw.PagesReady ?? 0),
    openTaskCount: Number(raw.openTaskCount ?? raw.OpenTaskCount ?? 0),
    checks: ((raw.checks ?? raw.Checks) as Record<string, unknown>[] | undefined)?.map((c) => ({
      key: String(c.key ?? c.Key ?? ''),
      label: translateText(String(c.label ?? c.Label ?? '')),
      passed: Boolean(c.passed ?? c.Passed),
      detail: c.detail || c.Detail ? translateText(String(c.detail ?? c.Detail)) : undefined,
    })) ?? [],
    blockers: ((raw.blockers ?? raw.Blockers) as string[] | undefined)?.map(translateText) ?? [],
  };
};

export const useChapterProductionReadiness = (chapterId?: string, enabled = true) =>
  useQuery({
    queryKey: ['chapter', chapterId, 'production-readiness'],
    queryFn: async () => {
      const res = await seriesApi.getChapterProductionReadiness(chapterId as string);
      const apiData = res.data as ApiResponse<Record<string, unknown>>;
      if (!isApiSuccess(apiData) || !apiData.data) {
        throw new Error(apiData.message || 'Không tải được trạng thái sản xuất');
      }
      return mapReadiness(apiData.data);
    },
    enabled: !!chapterId && enabled,
    refetchInterval: (query) => (query.state.error ? false : 15_000),
    retry: 1,
  });

export const useSubmitChapterForReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (chapterId: string) => {
      try {
        const res = await seriesApi.submitChapterForReview(chapterId);
        const apiData = res.data as ApiResponse<unknown>;
        if (!isApiSuccess(apiData)) {
          throw new Error(apiData.message || 'Nộp chapter thất bại');
        }
        return apiData;
      } catch (err) {
        throw new Error(getAxiosErrorMessage(err, 'Nộp chapter thất bại'), { cause: err });
      }
    },
    onSuccess: (_data, chapterId) => {
      toast.success('Đã nộp chapter lên Editor — chờ biên tập QC');
      queryClient.setQueryData(['chapter', chapterId], (old: unknown) => {
        if (!old || typeof old !== 'object') return old;
        return { ...old, status: 'UnderReview' };
      });
      void queryClient.invalidateQueries({ queryKey: ['chapter', chapterId] });
      void queryClient.invalidateQueries({ queryKey: ['chapter', chapterId, 'production-readiness'] });
      void queryClient.invalidateQueries({ queryKey: ['chapters'] });
      void queryClient.refetchQueries({ queryKey: ['chapters'], type: 'active' });
      void queryClient.invalidateQueries({ queryKey: ['review'] });
      void queryClient.refetchQueries({ queryKey: ['review'], type: 'active' });
      void queryClient.invalidateQueries({ queryKey: ['pages', chapterId] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Không thể nộp chapter lên Editor');
    },
  });
};

export const useReplacePageImage = (chapterId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ pageId, file }: { pageId: string; file: File }) => {
      try {
        const res = await seriesApi.replacePageImage(pageId, file);
        const apiData = res.data as ApiResponse<unknown>;
        if (!isApiSuccess(apiData)) {
          throw new Error(apiData.message || 'Tải lại ảnh trang thất bại');
        }
        return apiData;
      } catch (err) {
        throw new Error(getAxiosErrorMessage(err, 'Tải lại ảnh trang thất bại'), { cause: err });
      }
    },
    onSuccess: (_data, { pageId }) => {
      toast.success('Đã tải lại ảnh trang — nhớ Đánh dấu sẵn sàng khi xong');
      void queryClient.invalidateQueries({ queryKey: ['pages', chapterId] });
      void queryClient.invalidateQueries({ queryKey: ['chapter', chapterId] });
      void queryClient.invalidateQueries({ queryKey: ['chapter', chapterId, 'production-readiness'] });
      void queryClient.invalidateQueries({ queryKey: ['chapter-revision-annotations', chapterId] });
      void queryClient.invalidateQueries({ queryKey: ['canvas', 'pages', chapterId] });
      void queryClient.invalidateQueries({ queryKey: ['canvas', 'regions', pageId] });
      void queryClient.invalidateQueries({ queryKey: ['canvas', 'annotations', pageId] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Không thể tải lại ảnh trang');
    },
  });
};
