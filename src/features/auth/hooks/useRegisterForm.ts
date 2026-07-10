import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { authApi } from '../api/auth.api';
import type { RegisterFormData, RegisterFormErrors } from '../types/register.types';

const INITIAL_FORM_DATA: RegisterFormData = {
  userName: '',
  email: '',
  password: '',
  confirmPassword: '',
  fullName: '',
  portfolioUrl: '',
  specialtyTags: '',
  verificationCode: '',
};

export const useRegisterForm = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<RegisterFormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<RegisterFormErrors>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

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
      // Tên đăng nhập
      if (!formData.userName.trim()) newErrors.userName = 'Vui lòng nhập tên đăng nhập';
      else if (formData.userName.length < 3) newErrors.userName = 'Tên đăng nhập phải chứa ít nhất 3 ký tự';
      else if (formData.userName.length > 100) newErrors.userName = 'Tên đăng nhập không được vượt quá 100 ký tự';
      else if (!/^[a-zA-Z0-9._]+$/.test(formData.userName)) newErrors.userName = 'Tên đăng nhập chỉ chứa chữ không dấu, số, "_" hoặc "."';

      // Email
      if (!formData.email.trim()) newErrors.email = 'Vui lòng nhập email';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Định dạng email không hợp lệ';
      else if (formData.email.length > 150) newErrors.email = 'Email không được vượt quá 150 ký tự';

      // Mật khẩu
      if (!formData.password) newErrors.password = 'Vui lòng nhập mật khẩu';
      else if (formData.password.length < 8) newErrors.password = 'Mật khẩu phải chứa ít nhất 8 ký tự';
      else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$/.test(formData.password)) {
        newErrors.password = 'Mật khẩu phải chứa chữ hoa, chữ thường, số và ký tự đặc biệt';
      }

      // Xác nhận mật khẩu
      if (!formData.confirmPassword) newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
      else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    if (step === 1) {
      // Họ và tên
      if (!formData.fullName.trim()) newErrors.fullName = 'Vui lòng nhập họ và tên';
      else if (formData.fullName.length > 100) newErrors.fullName = 'Họ tên không được vượt quá 100 ký tự';
      else if (!/^[\p{L}\p{M}\s]+$/u.test(formData.fullName)) newErrors.fullName = 'Họ tên chỉ được phép chứa chữ cái và khoảng trắng';

      // Portfolio URL (Tuỳ chọn)
      if (formData.portfolioUrl.trim()) {
        if (formData.portfolioUrl.length > 500) newErrors.portfolioUrl = 'Link Portfolio không được vượt quá 500 ký tự';
        else {
          try {
            const parsed = new URL(formData.portfolioUrl);
            if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
              newErrors.portfolioUrl = 'Link portfolio phải bắt đầu bằng http:// hoặc https://';
            }
          } catch {
            newErrors.portfolioUrl = 'Link portfolio không hợp lệ';
          }
        }
      }

      // Kỹ năng chuyên môn (Tuỳ chọn)
      if (formData.specialtyTags.trim()) {
        if (formData.specialtyTags.length > 500) newErrors.specialtyTags = 'Thông tin kỹ năng không được vượt quá 500 ký tự';
      }
    }

    if (step === 2) {
      if (!formData.verificationCode.trim()) newErrors.verificationCode = 'Vui lòng nhập mã OTP';
      else if (formData.verificationCode.length !== 6) newErrors.verificationCode = 'Mã OTP phải gồm 6 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const nextStep = useCallback(() => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 2));
    }
  }, [currentStep, validateStep]);

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(currentStep)) return;
    
    if (currentStep === 1) {
      setShowConfirmModal(true);
    } else if (currentStep === 2) {
      try {
        setIsLoading(true);
        const response = await authApi.registerAssistant({
          userName: formData.userName,
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          portfolioUrl: formData.portfolioUrl,
          skills: formData.specialtyTags,
          verificationCode: formData.verificationCode
        });

        if (response.success) {
          toast.success('Xác thực thành công! Vui lòng chờ Admin duyệt tài khoản.');
          navigate('/login');
        }
      } catch (error: unknown) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        toast.error(axiosError.response?.data?.message || 'Mã OTP không hợp lệ!');
      } finally {
        setIsLoading(false);
      }
    }
  }, [currentStep, validateStep, formData, navigate]);

  const confirmSubmit = useCallback(async () => {
    try {
      setIsLoading(true);

      const response = await authApi.registerAssistant({
        userName: formData.userName,
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        portfolioUrl: formData.portfolioUrl,
        skills: formData.specialtyTags,
      });

      setShowConfirmModal(false);
      
      if (response.success) {
        if (response.data?.requiresVerification) {
          setCurrentStep(2);
          toast.success(response.data?.message || 'Mã OTP đã được gửi đến email của bạn');
        } else {
          toast.success('Đăng ký thành công! Vui lòng chờ Admin duyệt tài khoản.');
          navigate('/login');
        }
      }
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      toast.error(axiosError.response?.data?.message || 'Đăng ký thất bại! Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  }, [formData, navigate]);

  const closeConfirmModal = useCallback(() => {
    if (!isLoading) setShowConfirmModal(false);
  }, [isLoading]);

  return {
    formData,
    errors,
    isLoading,
    currentStep,
    showConfirmModal,
    handleChange,
    handleSubmit,
    confirmSubmit,
    closeConfirmModal,
    nextStep,
    prevStep,
  };
};
