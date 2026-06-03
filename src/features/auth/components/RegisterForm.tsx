import { Link } from 'react-router-dom';
import { User, Mail, Lock, Briefcase, Tags, Loader2, Pen, ArrowRight, ArrowLeft, UserCheck, ShieldCheck } from 'lucide-react';
import { useRegisterForm } from '../hooks/useRegisterForm';
import { RegisterInput } from './RegisterInput';
import { StepIndicator } from './StepIndicator';

const STEP_LABELS = ['Tài khoản', 'Hồ sơ'];

export const RegisterForm = () => {
  const {
    formData,
    errors,
    isLoading,
    currentStep,
    handleChange,
    handleSubmit,
    nextStep,
    prevStep,
  } = useRegisterForm();

  return (
    <div className="w-full lg:w-[52%] flex flex-col justify-center px-6 py-8 sm:px-10 xl:px-20 xl:py-10 relative h-screen overflow-hidden">
      {/* Background orbs */}
      <div className="absolute top-[-200px] right-[-200px] w-[500px] h-[500px] bg-brand/8 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-200px] left-[-200px] w-[500px] h-[500px] bg-info/8 rounded-full blur-[150px] pointer-events-none" />

      <div className="w-full max-w-lg mx-auto relative z-10">
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

            {/* Info cards */}
            <div className="space-y-3">
              {/* Approval notice */}
              <div className="bg-warning/5 border border-warning/20 rounded-xl p-4 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4 text-warning" />
                </div>
                <div>
                  <p className="text-warning text-xs font-medium mb-0.5">Cần phê duyệt</p>
                  <p className="text-text-secondary text-xs leading-relaxed">
                    Sau khi đăng ký, tài khoản cần được <strong className="text-text-primary">Admin phê duyệt</strong> trước khi bạn có thể nhận task từ Mangaka.
                  </p>
                </div>
              </div>

              {/* Work model notice */}
              <div className="bg-brand/5 border border-brand/20 rounded-xl p-4 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-brand text-xs font-medium mb-0.5">Mô hình làm việc</p>
                  <p className="text-text-secondary text-xs leading-relaxed">
                    Bạn sẽ làm việc trực tiếp với từng Mangaka — nhận task, nộp bài, nhận thanh toán. Không có nhóm hay đội ngũ cố định.
                  </p>
                </div>
              </div>
            </div>

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
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  'Gửi đăng ký'
                )}
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

        {/* Terms */}
        <p className="text-center text-text-muted text-[11px] mt-4 leading-relaxed">
          Bằng việc đăng ký, bạn đồng ý với{' '}
          <a href="#" className="text-text-secondary hover:text-text-primary underline">Điều khoản sử dụng</a>
          {' '}và{' '}
          <a href="#" className="text-text-secondary hover:text-text-primary underline">Chính sách bảo mật</a>
          {' '}của chúng tôi.
        </p>
      </div>
    </div>
  );
};
