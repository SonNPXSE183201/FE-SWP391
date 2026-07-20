import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contractApi } from '../api/contract.api';

const KEYS = {
  approvedSeries: ['contracts', 'series', 'approved'] as const,
  contractTemplates: ['contracts', 'templates'] as const,
};

export const useApprovedSeries = () =>
  useQuery({
    queryKey: KEYS.approvedSeries,
    queryFn: () => contractApi.getApprovedSeries(),
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchInterval: 5_000,
  });

export const useContractTemplates = () =>
  useQuery({
    queryKey: KEYS.contractTemplates,
    queryFn: () => contractApi.getContractTemplates(),
    staleTime: 60_000,
  });

export const useCreateContract = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      seriesId,
      baseGenkouryoPrice,
      templateId,
    }: {
      seriesId: string;
      baseGenkouryoPrice: number;
      templateId: number;
    }) => contractApi.createContract(seriesId, baseGenkouryoPrice, templateId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: KEYS.approvedSeries });
      await qc.refetchQueries({ queryKey: KEYS.approvedSeries, type: 'active' });
    },
  });
};

export const useUpdateContract = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { contractId: string; genkouryoPrice?: number; endDate?: string }) =>
      contractApi.updateContract({
        contractId: payload.contractId,
        genkouryoPrice: payload.genkouryoPrice,
        endDate: payload.endDate,
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: KEYS.approvedSeries });
      await qc.refetchQueries({ queryKey: KEYS.approvedSeries, type: 'active' });
    },
  });
};

export const useCreateTemplate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ content, isActive }: { content: string; isActive: boolean }) =>
      contractApi.createContractTemplate(content, isActive),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: KEYS.contractTemplates });
    },
  });
};

export const useUpdateTemplate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, content, isActive }: { id: number; content: string; isActive: boolean }) =>
      contractApi.updateContractTemplate(id, content, isActive),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: KEYS.contractTemplates });
      // Invalidate approvedSeries too since the active template choice might affect UI dropdowns
      await qc.invalidateQueries({ queryKey: KEYS.approvedSeries });
    },
  });
};

export const useDeleteTemplate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => contractApi.deleteContractTemplate(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: KEYS.contractTemplates });
    },
  });
};
