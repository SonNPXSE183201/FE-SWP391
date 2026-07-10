import { useMutation } from '@tanstack/react-query';
import { profileApi } from '../api/profileApi';
import { toast } from 'react-hot-toast';

export const useUploadAvatar = () => {
  return useMutation({
    mutationFn: (formData: FormData) => profileApi.uploadAvatar(formData),
    onError: (error) => {
      console.error(error);
      toast.error('Lỗi khi tải ảnh lên. Vui lòng thử lại!');
    }
  });
};
