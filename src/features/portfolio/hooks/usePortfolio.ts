import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { portfolioApi } from '../api/portfolio.api';

export const usePortfolioStats = () => {
  return useQuery({
    queryKey: ['portfolio', 'stats'],
    queryFn: async () => {
      const response = await portfolioApi.getPortfolioStats();
      const apiResponse = response.data;
      if (!apiResponse.IsSuccess || !apiResponse.Data) {
        throw new Error(apiResponse.Message || 'Failed to fetch portfolio stats');
      }
      return apiResponse.Data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const usePortfolioSamples = () => {
  return useQuery({
    queryKey: ['portfolio', 'samples'],
    queryFn: async () => {
      const response = await portfolioApi.getSamples();
      const apiResponse = response.data;
      if (!apiResponse.IsSuccess || !apiResponse.Data) {
        throw new Error(apiResponse.Message || 'Failed to fetch portfolio samples');
      }
      return apiResponse.Data;
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
