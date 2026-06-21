import { axiosInstance, ApiResponse } from '../../../api/axios';
import type { MockWallet, MockTransaction } from '../data/mockData';

export const fetchWallet = async (): Promise<MockWallet> => {
  const res = await axiosInstance.get<ApiResponse<MockWallet>>('/api/wallet');
  return res.data?.data as MockWallet;
};

export const fetchTransactions = async (): Promise<MockTransaction[]> => {
  const res = await axiosInstance.get<ApiResponse<MockTransaction[]>>('/api/wallet/transactions');
  return res.data?.data ?? [];
};

export const createTransaction = async (payload: Partial<MockTransaction>) => {
  const res = await axiosInstance.post<ApiResponse<MockTransaction>>('/api/wallet/transactions', payload);
  return res.data?.data as MockTransaction;
};
