import type { ApiResponse, PagedResult } from './generated/types';

export function isApiSuccess<T>(payload: ApiResponse<T> | undefined | null): boolean {
  return payload?.success === true;
}

export function getApiData<T>(payload: ApiResponse<T> | undefined | null): T | undefined {
  return payload?.data;
}

export function getApiMessage(
  payload: { message?: string | null } | undefined | null,
  fallback = '',
): string {
  return payload?.message || fallback;
}

export function getPagedItems<T>(data: unknown): T[] {
  if (!data) return [];
  if (Array.isArray(data)) return data as T[];
  if (typeof data === 'object' && data !== null && 'items' in data) {
    const items = (data as { items?: T[] | null }).items;
    return items ?? [];
  }
  return [];
}

export function unwrapPaged<T>(payload: ApiResponse<unknown>) {
  const raw = payload.data;
  if (!raw) {
    return { items: [] as T[], totalPages: 1, totalItems: 0, pageNumber: 1 };
  }
  if (Array.isArray(raw)) {
    return { items: raw, totalPages: 1, totalItems: raw.length, pageNumber: 1 };
  }
  const items = (raw as PagedResult<T>).items ?? [];
  const paged = raw as PagedResult<T>;
  return {
    items,
    totalPages: paged.totalPages ?? 1,
    totalItems: paged.totalItems ?? items.length,
    pageNumber: paged.pageNumber ?? 1,
  };
}

export function unwrapApiData<T>(
  payload: ApiResponse<T> | undefined,
  fallbackMessage: string,
): T {
  if (!isApiSuccess(payload)) {
    throw new Error(getApiMessage(payload, fallbackMessage));
  }
  if (payload?.data === undefined || payload.data === null) {
    throw new Error(fallbackMessage);
  }
  return payload.data;
}

export function getAxiosErrorMessage(error: unknown, fallback: string): string {
  const err = error as {
    response?: {
      data?: {
        message?: string;
        errors?: Record<string, string[]>;
      };
    };
  };

  // Try to extract specific field-level validation errors first
  const errors = err.response?.data?.errors;
  if (errors && typeof errors === 'object') {
    const messages = Object.values(errors).flat().filter(Boolean);
    if (messages.length > 0) {
      return messages.join('. ');
    }
  }

  return err.response?.data?.message || fallback;
}

export function createMockApiResponse<T>(data: T, message = 'Success') {
  return {
    data: {
      success: true,
      statusCode: 200,
      message,
      data,
    } satisfies ApiResponse<T>,
  };
}
