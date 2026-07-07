import { useMutation } from '@tanstack/react-query';
import { suggestTags } from '../api/ai.api';

export const useSuggestTags = () => {
  return useMutation({
    mutationFn: (synopsis: string) => suggestTags(synopsis),
  });
};
