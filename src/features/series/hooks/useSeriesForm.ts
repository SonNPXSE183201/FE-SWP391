import { useState, useCallback } from 'react';
import type { SeriesFormData, SeriesFormErrors } from '../types/series.types';

const INITIAL_FORM_DATA: SeriesFormData = {
  title: '',
  synopsis: '',
  genre: [],
  coverImage: null,
  coverPreviewUrl: '',
};

export const useSeriesForm = () => {
  const [formData, setFormData] = useState<SeriesFormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<SeriesFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = useCallback(<K extends keyof SeriesFormData>(
    field: K,
    value: SeriesFormData[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for that field
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }, []);

  const handleCoverImage = useCallback((file: File | null) => {
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setFormData((prev) => ({
        ...prev,
        coverImage: file,
        coverPreviewUrl: previewUrl,
      }));
      setErrors((prev) => ({ ...prev, coverImage: undefined }));
    } else {
      setFormData((prev) => ({
        ...prev,
        coverImage: null,
        coverPreviewUrl: '',
      }));
    }
  }, []);

  const toggleGenre = useCallback((genre: string) => {
    setFormData((prev) => ({
      ...prev,
      genre: prev.genre.includes(genre)
        ? prev.genre.filter((g) => g !== genre)
        : [...prev.genre, genre],
    }));
    setErrors((prev) => ({ ...prev, genre: undefined }));
  }, []);

  const validate = useCallback((): boolean => {
    const newErrors: SeriesFormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Tiêu đề series là bắt buộc';
    } else if (formData.title.trim().length < 2) {
      newErrors.title = 'Tiêu đề phải có ít nhất 2 ký tự';
    }

    if (!formData.synopsis.trim()) {
      newErrors.synopsis = 'Tóm tắt nội dung là bắt buộc';
    } else if (formData.synopsis.trim().length < 20) {
      newErrors.synopsis = 'Tóm tắt phải có ít nhất 20 ký tự';
    }

    if (formData.genre.length === 0) {
      newErrors.genre = 'Chọn ít nhất 1 thể loại';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const reset = useCallback(() => {
    setFormData(INITIAL_FORM_DATA);
    setErrors({});
    setIsSubmitting(false);
  }, []);

  return {
    formData,
    errors,
    isSubmitting,
    setIsSubmitting,
    updateField,
    handleCoverImage,
    toggleGenre,
    validate,
    reset,
  };
};
