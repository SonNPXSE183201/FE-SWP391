import { Link } from 'react-router-dom';
import { User, Mail, Lock, Briefcase, Tags, Loader2, Pen, ArrowRight, ArrowLeft } from 'lucide-react';
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
    <div className="w-full lg:w-[52%] flex flex-col justify-center px-6 py-8 sm:px-10 xl:px-20 xl:py-10 relative overflow-y-auto max-h-screen register-scrollbar">
      {/* Background orbs */}
      <div className="absolute top-[-200px] right-[-200px] w-[500px] h-[500px] bg-emerald-600/8 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-200px] left-[-200px] w-[500px] h-[500px] bg-blue-600/8 rounded-full blur-[150px] pointer-events-none" />

      <div className="w-full max-w-lg mx-auto relative z-10">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-1 w-8 rounded-full bg-gradient-to-r from-emerald-400 to-blue-400" />
            <span className="text-emerald-400 text-xs font-semibold tracking-widest uppercase">
              Đăng ký Assistant
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1.5">
            Tạo tài khoản mới
          </h1>
          <p className="text-slate-400 text-sm">
            Điền thông tin bên dưới để bắt đầu hành trình sáng tạo.
          </p>
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
                className="w-full bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-400 hover:to-blue-400 text-white font-semibold py-3.5 rounded-xl transition-all duration-300 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 active:scale-[0.98] flex items-center justify-center gap-2 group"
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
              hint="Tên hiển thị trên hệ thống"
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
              hint="Cách nhau bằng dấu phẩy"
            />

            {/* Info card */}
            <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-blue-300 text-xs font-medium mb-0.5">Lưu ý</p>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Sau khi đăng ký, tài khoản cần được Admin phê duyệt trước khi bạn có thể nhận task.
                </p>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-3">
              <button
                type="button"
                onClick={prevStep}
                className="flex-shrink-0 px-5 py-3.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800/50 hover:border-slate-600 transition-all duration-200 flex items-center gap-2 group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Quay lại
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-400 hover:to-blue-400 text-white font-semibold py-3.5 rounded-xl transition-all duration-300 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  'Hoàn tất đăng ký'
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Login link */}
        <p className="text-center text-slate-400 text-sm mt-8">
          Đã có tài khoản?{' '}
          <Link
            to="/login"
            className="text-emerald-400 hover:text-emerald-300 font-medium hover:underline transition-colors"
          >
            Đăng nhập ngay
          </Link>
        </p>

        {/* Terms */}
        <p className="text-center text-slate-600 text-[11px] mt-4 leading-relaxed">
          Bằng việc đăng ký, bạn đồng ý với{' '}
          <a href="#" className="text-slate-500 hover:text-slate-400 underline">Điều khoản sử dụng</a>
          {' '}và{' '}
          <a href="#" className="text-slate-500 hover:text-slate-400 underline">Chính sách bảo mật</a>
          {' '}của chúng tôi.
        </p>
      </div>
    </div>
  );
};
