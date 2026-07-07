import { useMutation } from '@tanstack/react-query';
import { segmentImage, visualizeSegmentImage } from '../api/ai.api';

export const useSegmentImage = () => {
  return useMutation({
    mutationFn: (imageUrl: string) => segmentImage(imageUrl),
  });
};

export const useVisualizeSegmentImage = () => {
  return useMutation({
    mutationFn: (imageUrl: string) => visualizeSegmentImage(imageUrl),
  });
};
