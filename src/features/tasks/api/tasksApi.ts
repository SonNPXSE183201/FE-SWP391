import { axiosInstance, ApiResponse } from '../../../api/axios';
import type { MockTask } from '../data/mockData';

export const fetchTasks = async (): Promise<MockTask[]> => {
  const res = await axiosInstance.get<ApiResponse<MockTask[]>>('/api/tasks');
  return res.data?.data ?? [];
};

export const createTask = async (payload: Partial<MockTask>): Promise<MockTask> => {
  const res = await axiosInstance.post<ApiResponse<MockTask>>('/api/tasks', payload);
  return res.data?.data as MockTask;
};
