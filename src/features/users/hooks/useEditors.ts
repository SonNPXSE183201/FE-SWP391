import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../admin/api/admin.api';

/** Active Tantou Editors for Mangaka assignment (Phương án 3). */
export const useEditors = () => {
  return useQuery({
    queryKey: ['admin-editors'],
    queryFn: async () => {
      const response = await adminApi.getUsers({
        role: 'Editor',
        status: 'Active',
        page: 1,
        pageSize: 100,
      });
      return response.data.data?.items ?? [];
    },
    staleTime: 60_000,
  });
};
