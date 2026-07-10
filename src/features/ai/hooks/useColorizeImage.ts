import { useMutation } from '@tanstack/react-query';
import { colorizeImage } from '../api/ai.api';

export const useColorizeImage = () => {
  return useMutation({
    mutationFn: (imageUrl: string) => colorizeImage(imageUrl),
  });
};
