import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { authApi } from '../../../api/auth.api';
import type { RegisterFormData, RegisterFormErrors } from '../types/register.types';

const INITIAL_FORM_DATA: RegisterFormData = {
  userName: '',
  email: '',
  password: '',
  confirmPassword: '',
  fullName: '',
  portfolioUrl: '',
  specialtyTags: '',
};

export const useRegisterForm = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<RegisterFormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<RegisterFormErrors>({});
  const [currentStep, setCurrentStep] = useState(0);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name as keyof RegisterFormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }, [errors]);

  const validateStep = useCallback((step: number): boolean => {
    const newErrors: RegisterFormErrors = {};

    if (step === 0) {
      if (!formData.userName.trim()) newErrors.userName = 'Vui lòng nhập tên đăng nhập';
      else if (formData.userName.length < 3) newErrors.userName = 'Tên đăng nhập tối thiểu 3 ký tự';
      
      if (!formData.email.trim()) newErrors.email = 'Vui lòng nhập email';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Email không hợp lệ';
      
      if (!formData.password) newErrors.password = 'Vui lòng nhập mật khẩu';
      else if (formData.password.length < 6) newErrors.password = 'Mật khẩu tối thiểu 6 ký tự';
      
      if (!formData.confirmPassword) newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
      else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    if (step === 1) {
      if (!formData.fullName.trim()) newErrors.fullName = 'Vui lòng nhập họ và tên';
      if (!formData.portfolioUrl.trim()) newErrors.portfolioUrl = 'Vui lòng nhập link portfolio';
      else {
        try {
          new URL(formData.portfolioUrl);
        } catch {
          newErrors.portfolioUrl = 'Link portfolio không hợp lệ';
        }
      }
      if (!formData.specialtyTags.trim()) newErrors.specialtyTags = 'Vui lòng nhập ít nhất 1 kỹ năng';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const nextStep = useCallback(() => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 1));
    }
  }, [currentStep, validateStep]);

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep(currentStep)) return;

    try {
      setIsLoading(true);
      const tagsArray = formData.specialtyTags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      await authApi.registerAssistant({
        userName: formData.userName,
        email: formData.email,
        passwordHash: formData.password,
        fullName: formData.fullName,
        portfolioUrl: formData.portfolioUrl,
        specialtyTags: tagsArray,
      });

      toast.success('Đăng ký thành công! Vui lòng chờ Admin duyệt tài khoản.');
      navigate('/login');
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      toast.error(axiosError.response?.data?.message || 'Đăng ký thất bại! Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  }, [formData, currentStep, validateStep, navigate]);

  return {
    formData,
    errors,
    isLoading,
    currentStep,
    handleChange,
    handleSubmit,
    nextStep,
    prevStep,
  };
};
