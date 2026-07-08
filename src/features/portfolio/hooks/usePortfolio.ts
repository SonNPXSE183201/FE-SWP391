import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { portfolioApi } from '../api/portfolio.api';

export const usePortfolioStats = (assistantId?: number) => {
  return useQuery({
    queryKey: ['portfolio', 'stats', assistantId],
    queryFn: async () => {
      const response = await portfolioApi.getPortfolioStats(assistantId);
      const apiResponse = response.data;
      if (!apiResponse.success || !apiResponse.data) {
        throw new Error(apiResponse.message || 'Failed to fetch portfolio stats');
      }
      return apiResponse.data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const usePortfolioSamples = (assistantId?: number) => {
  return useQuery({
    queryKey: ['portfolio', 'samples', assistantId],
    queryFn: async () => {
      const response = await portfolioApi.getSamples(assistantId);
      const apiResponse = response.data;
      if (!apiResponse.success || !apiResponse.data) {
        throw new Error(apiResponse.message || 'Failed to fetch portfolio samples');
      }
      return apiResponse.data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useUploadPortfolioSample = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: portfolioApi.uploadSample,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio', 'samples'] });
    },
  });
};

export const useUploadPortfolioImage = () => {
  return useMutation({
    mutationFn: (file: File) => portfolioApi.uploadImage(file),
  });
};

export const useDeletePortfolioSample = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: portfolioApi.deleteSample,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio', 'samples'] });
    },
  });
};
