export interface RegisterFormData {
  userName: string;
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  portfolioUrl: string;
  specialtyTags: string;
}

export interface RegisterFormErrors {
  userName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  fullName?: string;
  portfolioUrl?: string;
  specialtyTags?: string;
}

export interface RegisterFieldProps {
  name: keyof RegisterFormData;
  label: string;
  type: string;
  placeholder: string;
  icon: React.ComponentType<{ className?: string }>;
  required?: boolean;
  minLength?: number;
  colSpan?: 1 | 2;
  hint?: string;
}
