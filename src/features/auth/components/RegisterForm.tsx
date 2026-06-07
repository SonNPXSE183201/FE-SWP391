import { Link } from 'react-router-dom';
import { User, Mail, Lock, Briefcase, Tags, Loader2, Pen, ArrowRight, ArrowLeft, UserCheck } from 'lucide-react';
import { useRegisterForm } from '../hooks/useRegisterForm';
import { RegisterInput } from './RegisterInput';
import { StepIndicator } from './StepIndicator';
import { RegisterConfirmModal } from './RegisterConfirmModal';

const STEP_LABELS = ['Tài khoản', 'Hồ sơ', 'Xác thực OTP'];

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
      {/* Animated background orbs */}
      <div className="absolute top-[-200px] right-[-200px] w-[500px] h-[500px] bg-brand/8 rounded-full blur-[150px] pointer-events-none animate-float" />
      <div className="absolute bottom-[-200px] left-[-200px] w-[500px] h-[500px] bg-info/8 rounded-full blur-[150px] pointer-events-none animate-float" style={{ animationDelay: '5s' }} />

      <div className="w-full max-w-lg mx-auto relative z-10">
        {/* Back to landing — slide in */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-text-muted hover:text-text-secondary text-sm mb-6 group transition-colors duration-200 animate-fade-in-down"
          style={{ animationDelay: '0.1s' }}
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
          <span>Trang chủ</span>
        </Link>

        {/* Header — staggered entrance */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
            <div className="h-1 w-8 rounded-full bg-gradient-to-r from-brand to-brand-hover animate-glow-line" />
            <span className="text-brand text-xs font-semibold tracking-widest uppercase">
              Đăng ký Trợ lý vẽ
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1.5 animate-fade-in-up" style={{ animationDelay: '0.25s' }}>
            Tạo tài khoản Freelancer
          </h1>
          <p className="text-text-secondary text-sm animate-fade-in-up" style={{ animationDelay: '0.35s' }}>
            Đăng ký để nhận task từ các Mangaka và bắt đầu kiếm thu nhập ngay.
          </p>
        </div>

        {/* Role badge — scale in */}
        <div
          className="flex items-center gap-2 mb-5 bg-brand/10 border border-brand/20 rounded-lg px-3 py-2 animate-scale-in"
          style={{ animationDelay: '0.4s' }}
        >
          <UserCheck className="w-4 h-4 text-brand" />
          <span className="text-brand text-xs font-medium">
            Vai trò: Trợ lý vẽ tự do (Freelancer)
          </span>
        </div>

        {/* Step indicator — fade in */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.45s' }}>
          <StepIndicator
            currentStep={currentStep}
            totalSteps={3}
            labels={STEP_LABELS}
          />
        </div>

        {/* Form — blur in */}
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Step 0: Account info */}
          <div
            className={`space-y-4 transition-all duration-500 ease-out ${
              currentStep === 0
                ? 'opacity-100 translate-x-0 scale-100'
                : 'opacity-0 -translate-x-12 scale-95 absolute pointer-events-none'
            }`}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="animate-blur-in" style={{ animationDelay: '0.5s' }}>
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
              </div>
              <div className="animate-blur-in" style={{ animationDelay: '0.6s' }}>
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
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="animate-blur-in" style={{ animationDelay: '0.7s' }}>
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
              </div>
              <div className="animate-blur-in" style={{ animationDelay: '0.8s' }}>
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
            </div>

            {/* Next button */}
            <div className="pt-3 animate-fade-in-up" style={{ animationDelay: '0.9s' }}>
              <button
                type="button"
                onClick={nextStep}
                className="w-full bg-gradient-to-r from-brand to-brand-hover hover:from-brand-hover hover:to-brand text-white font-semibold py-3.5 rounded-xl transition-all duration-300 shadow-brand hover:shadow-brand-hover hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] flex items-center justify-center gap-2 group"
              >
                Tiếp tục
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Step 1: Profile info */}
          <div
            className={`space-y-4 transition-all duration-500 ease-out ${
              currentStep === 1
                ? 'opacity-100 translate-x-0 scale-100'
                : currentStep > 1 
                  ? 'opacity-0 -translate-x-12 scale-95 absolute pointer-events-none'
                  : 'opacity-0 translate-x-12 scale-95 absolute pointer-events-none'
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
                className="flex-shrink-0 px-5 py-3.5 rounded-xl border border-border-custom text-text-secondary hover:bg-bg-surface/50 hover:border-text-muted hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center gap-2 group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Quay lại
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-brand to-brand-hover hover:from-brand-hover hover:to-brand text-white font-semibold py-3.5 rounded-xl transition-all duration-300 shadow-brand hover:shadow-brand-hover hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none flex items-center justify-center gap-2"
              >
                Gửi đăng ký
              </button>
            </div>
          </div>

          {/* Step 2: OTP info */}
          <div
            className={`space-y-4 transition-all duration-500 ease-out ${
              currentStep === 2
                ? 'opacity-100 translate-x-0 scale-100'
                : 'opacity-0 translate-x-12 scale-95 absolute pointer-events-none'
            }`}
          >
            <div className="text-center mb-6">
               <p className="text-text-secondary text-sm">Vui lòng nhập mã OTP gồm 6 chữ số đã được gửi đến email của bạn.</p>
            </div>
            <RegisterInput
              name="verificationCode"
              label="Mã OTP"
              type="text"
              placeholder="123456"
              icon={Lock}
              value={formData.verificationCode}
              error={errors.verificationCode}
              required
              onChange={handleChange}
              hint="Mã xác thực gồm 6 số"
            />

            {/* Buttons */}
            <div className="flex gap-3 pt-3">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-brand to-brand-hover hover:from-brand-hover hover:to-brand text-white font-semibold py-3.5 rounded-xl transition-all duration-300 shadow-brand hover:shadow-brand-hover hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none flex items-center justify-center gap-2"
              >
                {isLoading ? <Loader2 className="animate-spin w-5 h-5 mx-auto" /> : 'Xác thực & Hoàn tất'}
              </button>
            </div>
          </div>
        </form>

        {/* Login link — fade in */}
        <p className="text-center text-text-secondary text-sm mt-8 animate-fade-in-up" style={{ animationDelay: '1s' }}>
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
