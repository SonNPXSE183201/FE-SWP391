import { useEffect, useRef } from 'react';


interface HeroSectionProps {
  onGetStarted?: () => void;
  onLearnMore?: () => void;
}

export const HeroSection = ({ onGetStarted, onLearnMore }: HeroSectionProps) => {
  const heroRef = useRef<HTMLElement>(null);

  // Parallax mouse-follow effect for background gradients and floating images
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    const gradients = hero.querySelectorAll<HTMLElement>('.hero-bg-gradient');
    const floatingEls = hero.querySelectorAll<HTMLElement>('.hero-float-el');
    let animationFrameId: number;

    const handleMouseMove = (e: MouseEvent) => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }

      animationFrameId = requestAnimationFrame(() => {
        const { clientX, clientY } = e;
        const { innerWidth, innerHeight } = window;
        const xPercent = (clientX / innerWidth - 0.5) * 2;
        const yPercent = (clientY / innerHeight - 0.5) * 2;

        gradients.forEach((grad, i) => {
          const speed = (i + 1) * 8;
          grad.style.transform = `translate(${xPercent * speed}px, ${yPercent * speed}px)`;
        });

        floatingEls.forEach((el, i) => {
          const speed = (i + 1) * 4;
          el.style.transform = `translate(${xPercent * speed}px, ${yPercent * speed}px)`;
        });
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  return (
    <section
      className="relative min-h-screen flex items-center overflow-hidden bg-bg-primary"
      ref={heroRef}
      id="hero-section"
    >
      {/* Animated Background */}
      <div className="absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
        <div className="hero-bg-gradient absolute rounded-full blur-[120px] opacity-40 animate-float w-[600px] h-[600px] -top-[10%] -right-[5%] bg-[radial-gradient(circle,_#6C5CE7_0%,_transparent_70%)]" />
        <div className="hero-bg-gradient absolute rounded-full blur-[120px] opacity-40 animate-float w-[500px] h-[500px] -bottom-[15%] -left-[5%] bg-[radial-gradient(circle,_#00CECE_0%,_transparent_70%)] [animation-delay:-7s]" />
        <div className="hero-bg-gradient absolute rounded-full blur-[120px] opacity-20 animate-float w-[400px] h-[400px] top-1/2 left-[40%] bg-[radial-gradient(circle,_#e84393_0%,_transparent_70%)] [animation-delay:-14s]" />
        {/* Manga halftone pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle, #F0F0F5 1px, transparent 1px)`,
            backgroundSize: '16px 16px',
          }}
        />
        {/* Grid lines */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(rgba(108, 92, 231, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(108, 92, 231, 0.03) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
            maskImage: 'radial-gradient(ellipse 80% 60% at 50% 50%, black 30%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 50%, black 30%, transparent 100%)'
          }}
        />
      </div>

      <div className="relative z-[1] w-full max-w-[1280px] mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* Left Content */}
        <div className="flex flex-col gap-6 text-center lg:text-left items-center lg:items-start pt-24 lg:pt-0">
          {/* Announcement Badge */}
          <div className="animate-fade-in-up inline-flex items-center gap-2 px-4 py-1.5 bg-brand/10 border border-brand/25 rounded-full w-fit">
            <span className="w-2 h-2 rounded-full bg-success shadow-[0_0_8px_#00D68F] animate-pulse-dot" />
            <span className="text-[13px] font-medium text-brand-hover tracking-wide">
              Nền tảng xuất bản manga thế hệ mới
            </span>
          </div>

          {/* Heading */}
          <h1 className="animate-fade-in-up [animation-delay:0.1s] font-primary text-[clamp(36px,4.5vw,64px)] font-bold leading-[1.1] text-text-primary">
            Sáng tạo.{' '}
            <span className="bg-gradient-to-br from-brand via-secondary to-[#e84393] bg-clip-text text-transparent">
              Cộng tác.
            </span>
            <br />
            Xuất bản.
          </h1>

          {/* Description */}
          <p className="animate-fade-in-up [animation-delay:0.2s] text-[clamp(16px,1.2vw,18px)] text-text-secondary leading-relaxed max-w-[520px] mx-auto lg:mx-0">
            Nền tảng Digital Workspace chuyên nghiệp kết nối Mangaka, Editor và Assistant —
            số hóa toàn bộ quy trình từ bản thảo đến xuất bản, quản lý tài chính minh bạch.
          </p>

          {/* CTA Buttons */}
          <div className="animate-fade-in-up [animation-delay:0.3s] flex gap-4 items-center flex-wrap justify-center lg:justify-start">
            <button
              className="group inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-br from-brand to-brand-hover text-white text-[15px] font-semibold border-none rounded-lg-custom cursor-pointer transition-all duration-200 shadow-brand hover:-translate-y-0.5 hover:shadow-brand-hover active:translate-y-0 relative overflow-hidden"
              id="hero-cta-get-started"
              onClick={onGetStarted}
            >
              <span className="absolute inset-0 bg-gradient-to-br from-white/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              <span className="relative">Bắt đầu ngay</span>
              <svg
                className="relative transition-transform duration-200 group-hover:translate-x-0.5"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </button>
            <button
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-transparent text-text-primary text-[15px] font-medium border border-border-custom rounded-lg-custom cursor-pointer transition-all duration-200 hover:border-brand hover:text-brand-hover hover:bg-brand/5"
              id="hero-cta-learn-more"
              onClick={onLearnMore}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <polygon points="10,8 16,12 10,16 10,8" />
              </svg>
              Tìm hiểu thêm
            </button>
          </div>

          {/* Stats Row */}
          <div className="animate-fade-in-up [animation-delay:0.45s] flex gap-8 pt-4 justify-center lg:justify-start">
            <div className="flex flex-col gap-0.5">
              <span className="font-mono text-2xl font-bold text-text-primary">500+</span>
              <span className="text-[13px] text-text-muted tracking-wide">Mangaka</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="font-mono text-2xl font-bold text-text-primary">2,000+</span>
              <span className="text-[13px] text-text-muted tracking-wide">Chapters</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="font-mono text-2xl font-bold text-text-primary">99.9%</span>
              <span className="text-[13px] text-text-muted tracking-wide">Uptime</span>
            </div>
          </div>
        </div>

        {/* Right Visual — Hero Manga Illustration */}
        <div className="animate-fade-in-up [animation-delay:0.3s] relative flex justify-center items-center max-w-[560px] mx-auto lg:max-w-none">
          <div className="relative w-full">
            {/* Main Hero Image — Mangaka at work */}
            <div className="relative rounded-2xl overflow-hidden border border-brand/20 shadow-[0_20px_60px_rgba(108,92,231,0.25)]">
              <img
                src="/images/landing/hero-mangaka.png"
                alt="Mangaka creating manga on digital tablet"
                className="w-full h-auto object-cover"
                loading="eager"
              />
              {/* Gradient overlay at bottom for blending */}
              <div className="absolute inset-0 bg-gradient-to-t from-bg-primary/60 via-transparent to-transparent" />
              {/* Purple glow at top */}
              <div className="absolute -top-2 -left-2 -right-2 h-1 bg-gradient-to-r from-transparent via-brand to-transparent blur-sm" />
            </div>

            {/* Floating manga panel — top right */}
            <div className="hero-float-el absolute -top-4 -right-6 w-[140px] rounded-xl overflow-hidden border border-border-custom/60 shadow-lg-custom animate-float-card rotate-3 z-10 hidden md:block">
              <img
                src="/images/landing/manga-panels.png"
                alt="Manga panels"
                className="w-full h-[100px] object-cover"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-bg-primary/40 to-transparent" />
            </div>

            {/* Floating collaboration badge — bottom left */}
            <div className="hero-float-el absolute -bottom-3 -left-4 bg-bg-secondary/90 backdrop-blur-[16px] border border-border-custom/60 rounded-xl-custom px-4 py-3 flex items-center gap-3 shadow-lg-custom animate-float-card [animation-delay:-3s] z-10 hidden md:block">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-brand/30 border-2 border-bg-secondary flex items-center justify-center text-[10px] font-bold text-brand-hover">M</div>
                <div className="w-8 h-8 rounded-full bg-secondary/30 border-2 border-bg-secondary flex items-center justify-center text-[10px] font-bold text-secondary">E</div>
                <div className="w-8 h-8 rounded-full bg-success/30 border-2 border-bg-secondary flex items-center justify-center text-[10px] font-bold text-success">A</div>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-text-primary">12 đang hoạt động</span>
                <span className="text-[10px] text-text-muted">Cộng tác real-time</span>
              </div>
            </div>

            {/* Floating progress badge — top left */}
            <div className="hero-float-el absolute top-6 -left-8 bg-bg-secondary/90 backdrop-blur-[16px] border border-border-custom/60 rounded-xl-custom px-3 py-2.5 shadow-lg-custom animate-float-card [animation-delay:-5s] z-10 hidden lg:block">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse-dot" />
                <span className="text-[11px] font-semibold text-text-primary">Chapter 24</span>
              </div>
              <div className="w-24 h-1.5 bg-bg-surface rounded-full overflow-hidden">
                <div className="h-full w-[78%] bg-gradient-to-r from-brand to-secondary rounded-full" />
              </div>
              <span className="text-[10px] text-text-muted mt-1 block">78% hoàn thành</span>
            </div>

            {/* Floating particles */}
            <div className="absolute rounded-full opacity-30 animate-float-particle w-1.5 h-1.5 bg-brand top-[20%] left-[30%]" />
            <div className="absolute rounded-full opacity-30 animate-float-particle w-1 h-1 bg-secondary top-[60%] right-[20%] [animation-delay:-5s]" />
            <div className="absolute rounded-full opacity-30 animate-float-particle w-[5px] h-[5px] bg-success bottom-[25%] left-1/2 [animation-delay:-10s]" />
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="animate-fade-in-up [animation-delay:0.6s] absolute bottom-8 left-1/2 -translate-x-1/2 flex-col items-center gap-2 z-[1] hidden lg:flex">
        <div className="w-6 h-[38px] border-2 border-text-muted rounded-xl relative">
          <div className="absolute left-1/2 -translate-x-1/2 w-1 h-2 rounded-sm bg-brand animate-scroll-bounce top-2" />
        </div>
        <span className="text-[11px] text-text-muted tracking-widest uppercase">Scroll</span>
      </div>
    </section>
  );
};
