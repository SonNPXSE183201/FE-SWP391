import React from 'react';
import { LoginForm, LoginBackground } from '../index';

export const LoginPageLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex w-full relative overflow-hidden bg-bg-primary text-text-primary selection:bg-brand selection:text-white">
      {/* Background layer */}
      <LoginBackground />

      <div className="w-full flex flex-col lg:flex-row relative z-10 min-h-screen">
        {/* Left Column - Brand & Info (Hidden on mobile) */}
        <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 lg:p-20 border-r border-white/5 relative overflow-y-auto">
          {/* Hero Image Background */}
          <div className="absolute inset-0 pointer-events-none">
            <img
              src="/images/login-hero.png"
              alt="Manga workspace"
              className="w-full h-full object-cover"
            />
            {/* Gradient overlays - lighter to show more of the image */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#0F0F14]/85 via-[#0F0F14]/65 to-[#0F0F14]/40" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F14]/80 via-transparent to-[#0F0F14]/30" />
          </div>

          {/* Content over image */}
          <div className="relative z-20">
            <div className="space-y-6 animate-text-float" style={{ animationDelay: '1.5s' }}>
              <h1 className="text-4xl xl:text-5xl font-bold leading-snug pb-2 overflow-visible drop-shadow-lg">
                <span
                  className="inline-block animate-hero-text-reveal"
                  style={{ animationDelay: '0.2s' }}
                >
                  Nền tảng
                </span>
                <br />
                <span
                  className="inline-block animate-hero-text-reveal"
                  style={{ animationDelay: '0.35s' }}
                >
                  Xuất bản Manga
                </span>
                <br />
                <span
                  className="inline-block animate-hero-text-reveal text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-hover pb-1"
                  style={{ animationDelay: '0.5s' }}
                >
                  Chuyên nghiệp
                </span>
              </h1>
              <p
                className="text-lg text-text-secondary max-w-md animate-fade-in-up drop-shadow-md"
                style={{ animationDelay: '0.65s' }}
              >
                Quản lý quy trình sản xuất, xét duyệt và xuất bản manga trên cùng một không gian làm việc số hoá.
              </p>
            </div>
          </div>

          <div
            className="relative z-20 text-sm text-text-tertiary animate-fade-in-up"
            style={{ animationDelay: '0.8s' }}
          >
            &copy; {new Date().getFullYear()} Inku. Đây là dự án học tập — không phục vụ mục đích thương mại.
          </div>
        </div>

        {/* Right Column - Login Form */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 sm:p-12">
          <LoginForm />
        </div>
      </div>
    </div>
  );
};
