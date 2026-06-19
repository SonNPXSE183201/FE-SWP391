import { useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { seriesApi } from '../../series/api/series.api';
import { useAuthStore } from '../../../stores/authStore';

const STORAGE_PREFIX = 'inku-mangaka-on-leave';
const AUTH_STORAGE_KEY = 'auth-storage';
const migratedUserIds = new Set<string>();

const normalizeUserId = (id: string | number | undefined | null): string | undefined =>
  id == null || id === '' ? undefined : String(id);

const getStorageKey = (userId: string | undefined) =>
  `${STORAGE_PREFIX}-${userId ?? 'guest'}`;

/** Read user id from persisted auth before Zustand finishes hydrating. */
const getPersistedAuthUserId = (): string | undefined => {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as { state?: { user?: { id?: string | number } } };
    return normalizeUserId(parsed.state?.user?.id);
  } catch {
    return undefined;
  }
};

const readStoredOnLeave = (userId: string | undefined): boolean => {
  if (!userId) return false;
  try {
    return localStorage.getItem(getStorageKey(userId)) === 'true';
  } catch {
    return false;
  }
};

const writeStoredOnLeave = (userId: string | undefined, onLeave: boolean) => {
  if (!userId) return;
  try {
    localStorage.setItem(getStorageKey(userId), String(onLeave));
  } catch {
    // ignore
  }
};

/** Move legacy guest-key value to the real user key after login hydrate. */
const migrateGuestOnLeaveState = (userId: string) => {
  if (migratedUserIds.has(userId)) return;
  migratedUserIds.add(userId);
  try {
    const guestKey = getStorageKey(undefined);
    const userKey = getStorageKey(userId);
    const guestValue = localStorage.getItem(guestKey);
    if (guestValue !== null && localStorage.getItem(userKey) === null) {
      localStorage.setItem(userKey, guestValue);
      localStorage.removeItem(guestKey);
    }
  } catch {
    // ignore
  }
};

export const useMangakaOnLeave = () => {
  const userId = useAuthStore((s) => normalizeUserId(s.user?.id));
  const resolvedUserId = userId ?? getPersistedAuthUserId();

  if (resolvedUserId) {
    migrateGuestOnLeaveState(resolvedUserId);
  }

  const storedOnLeave = readStoredOnLeave(resolvedUserId);
  const [override, setOverride] = useState<boolean | null>(null);
  const isOnLeave = override ?? storedOnLeave;

  const mutation = useMutation({
    mutationFn: (onLeave: boolean) => seriesApi.toggleOnLeave(onLeave),
    onSuccess: (_res, onLeave) => {
      const id =
        normalizeUserId(useAuthStore.getState().user?.id) ?? getPersistedAuthUserId();
      setOverride(onLeave);
      writeStoredOnLeave(id, onLeave);
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
