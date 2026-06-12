import { useQuery } from '@tanstack/react-query';
import { seriesApi } from '../api/series.api';

export const useSeriesList = (params?: { page?: number; pageSize?: number; status?: string }) => {
    return useQuery({
        queryKey: ['series', params],
        queryFn: async () => {
            const res = await seriesApi.getAll(params);
            return res.data?.Data ?? [];
        },
        staleTime: 1000 * 60,
        retry: 1,
    });
};

export const useSeriesDetail = (id?: string) => {
    return useQuery({
        queryKey: ['series', id],
        queryFn: async () => {
            const res = await seriesApi.getById(id as string);
            return res.data?.Data ?? null;
        },
        enabled: !!id,
        retry: 1,
    });
};