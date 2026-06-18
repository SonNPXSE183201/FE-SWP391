import { useState, useEffect, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { seriesApi } from '../../series/api/series.api';
import { useAuthStore } from '../../../stores/authStore';

const STORAGE_PREFIX = 'inku-mangaka-on-leave';

const getStorageKey = (userId: string | number | undefined) =>
  `${STORAGE_PREFIX}-${userId ?? 'guest'}`;

export const useMangakaOnLeave = () => {
  const userId = useAuthStore((s) => s.user?.id);
  const [isOnLeave, setIsOnLeave] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(getStorageKey(userId));
      if (saved !== null) setIsOnLeave(saved === 'true');
    } catch {
      // ignore
    }
  }, [userId]);

  const mutation = useMutation({
    mutationFn: (onLeave: boolean) => seriesApi.toggleOnLeave(onLeave),
    onSuccess: (_res, onLeave) => {
      setIsOnLeave(onLeave);
      localStorage.setItem(getStorageKey(userId), String(onLeave));
      toast.success(onLeave ? 'Đã bật trạng thái Tạm nghỉ' : 'Đã tắt trạng thái Tạm nghỉ');
    },
    onError: () => {
      toast.error('Không thể cập nhật trạng thái Tạm nghỉ. Vui lòng thử lại.');
    },
  });

  const toggleOnLeave = useCallback(() => {
    mutation.mutate(!isOnLeave);
  }, [isOnLeave, mutation]);

  return { isOnLeave, toggleOnLeave, isPending: mutation.isPending };
};
