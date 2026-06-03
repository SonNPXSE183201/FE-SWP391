import { Link } from 'react-router-dom';
import { User, Mail, Lock, Briefcase, Tags, Loader2, Pen, ArrowRight, ArrowLeft, UserCheck } from 'lucide-react';
import { useRegisterForm } from '../hooks/useRegisterForm';
import { RegisterInput } from './RegisterInput';
import { StepIndicator } from './StepIndicator';
import { RegisterConfirmModal } from './RegisterConfirmModal';

const STEP_LABELS = ['Tài khoản', 'Hồ sơ'];

export const RegisterForm = () => {
  const {
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
  } = useRegisterForm();

  return (
    <div className="w-full lg:w-[52%] flex flex-col justify-center px-6 py-8 sm:px-10 xl:px-20 xl:py-10 relative h-screen overflow-hidden">
      {/* Background orbs */}
      <div className="absolute top-[-200px] right-[-200px] w-[500px] h-[500px] bg-brand/8 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-200px] left-[-200px] w-[500px] h-[500px] bg-info/8 rounded-full blur-[150px] pointer-events-none" />

      <div className="w-full max-w-lg mx-auto relative z-10">
        {/* Back to landing */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-text-muted hover:text-text-secondary text-sm mb-6 group transition-colors duration-200"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
          <span>Trang chủ</span>
        </Link>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-1 w-8 rounded-full bg-gradient-to-r from-brand to-brand-hover" />
            <span className="text-brand text-xs font-semibold tracking-widest uppercase">
              Đăng ký Assistant
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1.5">
            Tạo tài khoản Freelancer
          </h1>
          <p className="text-text-secondary text-sm">
            Đăng ký để nhận task từ các Mangaka và bắt đầu kiếm thu nhập ngay.
          </p>
        </div>

        {/* Role badge */}
        <div className="flex items-center gap-2 mb-5 bg-brand/10 border border-brand/20 rounded-lg px-3 py-2">
          <UserCheck className="w-4 h-4 text-brand" />
          <span className="text-brand text-xs font-medium">
            Vai trò: Assistant (Trợ lý vẽ tự do)
          </span>
        </div>

        {/* Step indicator */}
        <StepIndicator
          currentStep={currentStep}
          totalSteps={2}
          labels={STEP_LABELS}
        />

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Step 0: Account info */}
          <div
            className={`space-y-4 transition-all duration-300 ${
              currentStep === 0
                ? 'opacity-100 translate-x-0'
                : 'opacity-0 -translate-x-8 absolute pointer-events-none'
            }`}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <RegisterInput
                name="userName"
                label="Tên đăng nhập"
                type="text"
                placeholder="assistant_art"
                icon={User}
                value={formData.userName}
                error={errors.userName}
                required
                onChange={handleChange}
                hint="Tối thiểu 3 ký tự, không dấu cách"
              />
              <RegisterInput
                name="email"
                label="Email"
                type="email"
                placeholder="yourname@email.com"
                icon={Mail}
                value={formData.email}
                error={errors.email}
                required
                onChange={handleChange}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <RegisterInput
                name="password"
                label="Mật khẩu"
                type="password"
                placeholder="••••••••"
                icon={Lock}
                value={formData.password}
                error={errors.password}
                required
                minLength={6}
                onChange={handleChange}
                hint="Tối thiểu 6 ký tự"
              />
              <RegisterInput
                name="confirmPassword"
                label="Xác nhận mật khẩu"
                type="password"
                placeholder="••••••••"
                icon={Lock}
                value={formData.confirmPassword}
                error={errors.confirmPassword}
                required
                minLength={6}
                onChange={handleChange}
              />
            </div>

            {/* Next button */}
            <div className="pt-3">
              <button
                type="button"
                onClick={nextStep}
                className="w-full bg-gradient-to-r from-brand to-brand-hover hover:from-brand-hover hover:to-brand text-white font-semibold py-3.5 rounded-xl transition-all duration-300 shadow-brand hover:shadow-brand-hover active:scale-[0.98] flex items-center justify-center gap-2 group"
              >
                Tiếp tục
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Step 1: Profile info */}
          <div
            className={`space-y-4 transition-all duration-300 ${
              currentStep === 1
                ? 'opacity-100 translate-x-0'
                : 'opacity-0 translate-x-8 absolute pointer-events-none'
            }`}
          >
            <RegisterInput
              name="fullName"
              label="Họ và tên / Bút danh"
              type="text"
              placeholder="Ví dụ: Nguyễn Văn A (A-chan)"
              icon={Pen}
              value={formData.fullName}
              error={errors.fullName}
              required
              onChange={handleChange}
              hint="Tên hiển thị khi nhận task từ Mangaka"
            />
            <RegisterInput
              name="portfolioUrl"
              label="Link Portfolio"
              type="url"
              placeholder="https://artstation.com/yourname"
              icon={Briefcase}
              value={formData.portfolioUrl}
              error={errors.portfolioUrl}
              required
              onChange={handleChange}
              hint="ArtStation, DeviantArt, Google Drive..."
            />
            <RegisterInput
              name="specialtyTags"
              label="Kỹ năng chuyên môn"
              type="text"
              placeholder="Vẽ nền, Đổ bóng, Tô màu, Vẽ hiệu ứng..."
              icon={Tags}
              value={formData.specialtyTags}
              error={errors.specialtyTags}
              required
              onChange={handleChange}
              hint="Mangaka sẽ tìm kiếm bạn theo các kỹ năng này — cách nhau bằng dấu phẩy"
            />

            {/* Buttons */}
            <div className="flex gap-3 pt-3">
              <button
                type="button"
                onClick={prevStep}
                className="flex-shrink-0 px-5 py-3.5 rounded-xl border border-border-custom text-text-secondary hover:bg-bg-surface/50 hover:border-text-muted transition-all duration-200 flex items-center gap-2 group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Quay lại
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-brand to-brand-hover hover:from-brand-hover hover:to-brand text-white font-semibold py-3.5 rounded-xl transition-all duration-300 shadow-brand hover:shadow-brand-hover active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none flex items-center justify-center gap-2"
              >
                Gửi đăng ký
              </button>
            </div>
          </div>
        </form>

        {/* Login link */}
        <p className="text-center text-text-secondary text-sm mt-8">
          Đã có tài khoản?{' '}
          <Link
            to="/login"
            className="text-brand hover:text-brand-hover font-medium hover:underline transition-colors"
          >
            Đăng nhập ngay
          </Link>
        </p>
      </div>

      {/* Confirmation Modal */}
      <RegisterConfirmModal
        isOpen={showConfirmModal}
        isLoading={isLoading}
        onClose={closeConfirmModal}
        onConfirm={confirmSubmit}
      />
    </div>
  );
};
