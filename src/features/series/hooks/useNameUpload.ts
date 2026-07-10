import { useState, useRef, useCallback, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { seriesApi } from '../api/series.api';
import { isApiSuccess } from '../../../api/apiResponse';
import type { ApiResponse } from '../../../api/generated/types';
import type { SeriesDto } from '../../../api/generated/types';
import type { SeriesNameUpdateSnapshot } from '../api/series.api';

const MAX_FILE_SIZE_MB = 20;
const ACCEPTED_TYPE = 'application/pdf';

const fileNameFromUrl = (url: string): string => {
  try {
    const path = new URL(url, window.location.origin).pathname;
    const segment = path.split('/').pop();
    return segment ? decodeURIComponent(segment) : 'name-manuscript.pdf';
  } catch {
    const segment = url.split('/').pop();
    return segment ? decodeURIComponent(segment) : 'name-manuscript.pdf';
  }
};

interface UseNameUploadOptions {
  seriesId?: string;
  initialResourceFolderUrl?: string | null;
  seriesSnapshot?: SeriesNameUpdateSnapshot;
}

export const useNameUpload = ({
  seriesId,
  initialResourceFolderUrl,
  seriesSnapshot,
}: UseNameUploadOptions) => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [nameFileUrl, setNameFileUrl] = useState<string | null>(initialResourceFolderUrl ?? null);
  const [nameFileName, setNameFileName] = useState(
    initialResourceFolderUrl ? fileNameFromUrl(initialResourceFolderUrl) : '',
  );
  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    if (initialResourceFolderUrl) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setNameFileUrl(initialResourceFolderUrl);
       
      setNameFileName(fileNameFromUrl(initialResourceFolderUrl));
    } else {
       
      setNameFileUrl(null);
       
      setNameFileName('');
    }
  }, [initialResourceFolderUrl]);

  const persistToSeries = useCallback(
    async (resourceFolderUrl: string | null) => {
      if (!seriesId || !seriesSnapshot) {
        throw new Error('Thiếu thông tin series để lưu bản phác thảo.');
      }

      const res = await seriesApi.saveNameManuscript(seriesId, seriesSnapshot, resourceFolderUrl);
      const apiData = res.data as ApiResponse<SeriesDto>;

      if (!isApiSuccess(apiData)) {
        throw new Error(apiData.message || 'Lưu bản phác thảo (Name) thất bại');
      }

      await queryClient.invalidateQueries({ queryKey: ['series', seriesId] });
      return apiData.data?.resourceFolderUrl ?? resourceFolderUrl;
    },
    [seriesId, seriesSnapshot, queryClient],
  );

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!seriesId || !seriesSnapshot) {
        toast.error('Không xác định được series. Vui lòng tải lại trang.');
        return;
      }

      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        toast.error(`File phác thảo không được vượt quá ${MAX_FILE_SIZE_MB}MB`);
        return;
      }
      if (file.type !== ACCEPTED_TYPE) {
        toast.error('Vui lòng chọn file PDF');
        return;
      }

      setIsUploading(true);
      try {
        const url = await seriesApi.uploadSeriesFile(file);
        const savedUrl = await persistToSeries(url);
        setNameFileUrl(savedUrl);
        setNameFileName(file.name);
        toast.success('Đã lưu bản phác thảo (Name) lên hệ thống.');
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : 'Upload bản phác thảo thất bại.';
        toast.error(msg);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } finally {
        setIsUploading(false);
      }
    },
    [seriesId, seriesSnapshot, persistToSeries],
  );

  const removeFile = useCallback(async () => {
    if (!nameFileUrl) return;

    if (!seriesId || !seriesSnapshot) {
      setNameFileUrl(null);
      setNameFileName('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setIsRemoving(true);
    try {
      await persistToSeries(null);
      setNameFileUrl(null);
      setNameFileName('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      toast.success('Đã xóa bản phác thảo (Name).');
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Xóa bản phác thảo thất bại.';
      toast.error(msg);
    } finally {
      setIsRemoving(false);
    }
  }, [nameFileUrl, seriesId, seriesSnapshot, persistToSeries]);

  const openFilePicker = useCallback(() => {
    if (isUploading || isRemoving) return;
    fileInputRef.current?.click();
  }, [isUploading, isRemoving]);

  return {
    fileInputRef,
    nameFileUrl,
    nameFileName,
    hasNameManuscript: !!nameFileUrl,
    isUploading,
    isRemoving,
    handleFileChange,
    removeFile,
    openFilePicker,
  };
};
