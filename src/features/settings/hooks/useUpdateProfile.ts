import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { profileApi, UpdateProfileDto } from '../api/profileApi';
import { useAuthStore } from '../../../stores/authStore';

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { updateUser } = useAuthStore();

  return useMutation({
    mutationFn: (data: UpdateProfileDto) => profileApi.updateProfile(data),
    onSuccess: (_, variables) => {
      updateUser(variables);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (error) => {
      console.error(error);
      toast.error('Lỗi khi lưu thông tin. Vui lòng thử lại!');
    }
  });
};
