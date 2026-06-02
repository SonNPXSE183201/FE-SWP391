import React from 'react';
import { LoginForm, LoginBackground } from '../../features/auth';
import { Logo } from '../../components/common/Logo';

export const LoginPage: React.FC = () => {
  return (
    <div className="min-h-screen flex w-full relative overflow-hidden bg-bg-primary text-text-primary selection:bg-brand selection:text-white">
      {/* Background layer */}
      <LoginBackground />

      <div className="w-full flex flex-col lg:flex-row relative z-10 min-h-screen">
        {/* Left Column - Brand & Info (Hidden on mobile) */}
        <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 lg:p-20 border-r border-white/5 relative overflow-hidden">
          {/* Hero Image Background */}
          <div className="absolute inset-0">
            <img
              src="/images/login-hero.png"
              alt="Manga workspace"
              className="w-full h-full object-cover"
            />
            {/* Gradient overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#0F0F14]/90 via-[#0F0F14]/75 to-[#0F0F14]/60" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F14]/80 via-transparent to-[#0F0F14]/40" />
          </div>

          {/* Content over image */}
          <div className="relative z-10">
            <Logo size="lg" />
            <div className="mt-12 space-y-6">
              <h1 className="text-4xl xl:text-5xl font-bold leading-tight drop-shadow-lg">
                Nền tảng <br />
                Xuất bản Manga <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-hover">
                  Chuyên nghiệp
                </span>
              </h1>
              <p className="text-lg text-text-secondary max-w-md drop-shadow-md">
                Quản lý quy trình sản xuất, xét duyệt và xuất bản manga trên cùng một không gian làm việc số hoá.
              </p>
            </div>
          </div>

          <div className="relative z-10 text-sm text-text-tertiary">
            &copy; {new Date().getFullYear()} Inku. Đây là dự án học tập — không phục vụ mục đích thương mại.
          </div>
        </div>

        {/* Right Column - Login Form */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 sm:p-12">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-12 self-start sm:self-center">
            <Logo />
          </div>

          <LoginForm />
        </div>
      </div>
    </div>
  );
};
