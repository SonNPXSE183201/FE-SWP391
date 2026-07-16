import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { profileApi, UpdateProfileDto } from '../api/profileApi';
import { useAuthStore, type User } from '../../../stores/authStore';

const toUserPatch = (data: UpdateProfileDto): Partial<User> => ({
  fullName: data.fullName ?? undefined,
  penName: data.penName ?? undefined,
  portfolioUrl: data.portfolioUrl ?? undefined,
  skills: data.skills ?? undefined,
  phoneNumber: data.phoneNumber ?? undefined,
  avatarUrl: data.avatarUrl ?? undefined,
  citizenId: data.citizenId ?? undefined,
  citizenIdIssueDate: data.citizenIdIssueDate ?? undefined,
  citizenIdIssuePlace: data.citizenIdIssuePlace ?? undefined,
});

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { updateUser } = useAuthStore();

  return useMutation({
    mutationFn: (data: UpdateProfileDto) => profileApi.updateProfile(data),
    onSuccess: (response, variables) => {
      updateUser(toUserPatch(response.data.data ?? variables));
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (error) => {
      console.error(error);
      toast.error('Lỗi khi lưu thông tin. Vui lòng thử lại!');
    }
  });
};
