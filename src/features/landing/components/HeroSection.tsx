import { useEffect, useRef, useState, useCallback } from 'react';

interface HeroSectionProps {
  onGetStarted?: () => void;
  onLearnMore?: () => void;
}

/** Animated counting number */
const AnimatedCounter = ({ end, suffix = '', duration = 2000, delay = 0 }: { end: number; suffix?: string; duration?: number; delay?: number }) => {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    const startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [started, end, duration]);

  return <>{count.toLocaleString()}{suffix}</>;
};

export const HeroSection = ({ onGetStarted, onLearnMore }: HeroSectionProps) => {
  const heroRef = useRef<HTMLElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Parallax mouse-follow effect for background gradients and floating elements
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    const gradients = hero.querySelectorAll<HTMLElement>('.hero-bg-gradient');
    const floatingEls = hero.querySelectorAll<HTMLElement>('.hero-float-el');
    let animationFrameId: number;

    const handleMouseMove = (e: MouseEvent) => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);

      animationFrameId = requestAnimationFrame(() => {
        const { clientX, clientY } = e;
        const { innerWidth, innerHeight } = window;
        const xPercent = (clientX / innerWidth - 0.5) * 2;
        const yPercent = (clientY / innerHeight - 0.5) * 2;

        setMousePos({ x: xPercent, y: yPercent });

        gradients.forEach((grad, i) => {
          const speed = (i + 1) * 8;
          grad.style.transform = `translate(${xPercent * speed}px, ${yPercent * speed}px)`;
        });

        floatingEls.forEach((el, i) => {
          const speed = (i + 1) * 5;
          el.style.transform = `translate(${xPercent * speed}px, ${yPercent * speed}px)`;
        });
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Interactive cursor glow
  const cursorGlowRef = useRef<HTMLDivElement>(null);
  const handleSectionMouseMove = useCallback((e: React.MouseEvent) => {
    if (cursorGlowRef.current) {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      cursorGlowRef.current.style.left = `${e.clientX - rect.left}px`;
      cursorGlowRef.current.style.top = `${e.clientY - rect.top}px`;
      cursorGlowRef.current.style.opacity = '1';
    }
  }, []);

  const handleSectionMouseLeave = useCallback(() => {
    if (cursorGlowRef.current) {
      cursorGlowRef.current.style.opacity = '0';
    }
  }, []);

  return (
    <section
      className="relative min-h-screen flex items-center overflow-hidden bg-bg-primary"
      ref={heroRef}
      id="hero-section"
      onMouseMove={handleSectionMouseMove}
      onMouseLeave={handleSectionMouseLeave}
    >
      {/* Interactive cursor glow */}
      <div
        ref={cursorGlowRef}
        className="absolute w-[400px] h-[400px] rounded-full pointer-events-none z-0 opacity-0 transition-opacity duration-500"
        style={{
          background: 'radial-gradient(circle, rgba(108, 92, 231, 0.08) 0%, transparent 70%)',
          transform: 'translate(-50%, -50%)',
        }}
        aria-hidden="true"
      />

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
            WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 50%, black 30%, transparent 100%)',
          }}
        />

        {/* Manga speed lines radiating from center-right */}
        <div
          className="absolute top-1/2 right-[25%] -translate-y-1/2 w-[800px] h-[800px] opacity-[0.04] pointer-events-none"
          style={{
            background: `repeating-conic-gradient(transparent 0deg, transparent 3deg, rgba(108,92,231,0.3) 3.5deg, transparent 4deg)`,
            maskImage: 'radial-gradient(circle, transparent 20%, black 40%, transparent 80%)',
            WebkitMaskImage: 'radial-gradient(circle, transparent 20%, black 40%, transparent 80%)',
            animation: 'rotate-slow 60s linear infinite',
          }}
        />

        {/* Floating particles — more varied */}
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={`particle-${i}`}
            className="absolute rounded-full animate-float-particle pointer-events-none"
            style={{
              width: `${2 + (i % 4) * 2}px`,
              height: `${2 + (i % 4) * 2}px`,
              left: `${5 + i * 9.5}%`,
              bottom: '-20px',
              backgroundColor: ['#6C5CE740', '#00CECE40', '#e8439340', '#00D68F40'][i % 4],
              animationDuration: `${10 + (i % 5) * 4}s`,
              animationDelay: `${i * 1.8}s`,
            }}
          />
        ))}

        {/* Floating manga element shapes */}
        <div className="absolute top-[15%] left-[8%] w-16 h-16 border border-brand/10 rounded-xl rotate-12 animate-float-card opacity-20 pointer-events-none" />
        <div className="absolute bottom-[20%] right-[8%] w-12 h-12 border border-secondary/10 rounded-full animate-float-card [animation-delay:-2s] opacity-20 pointer-events-none" />
        <div className="absolute top-[60%] left-[3%] w-8 h-8 bg-brand/5 rounded-md rotate-45 animate-float-card [animation-delay:-4s] pointer-events-none" />
      </div>

      <div className="relative z-[1] w-full max-w-[1280px] mx-auto px-8 pt-28 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* Left Content */}
        <div className="flex flex-col gap-6 text-center lg:text-left items-center lg:items-start">
          {/* Announcement Badge */}
          <div className="animate-fade-in-down [animation-delay:0.1s] inline-flex items-center gap-2 px-4 py-1.5 bg-brand/10 border border-brand/25 rounded-full w-fit backdrop-blur-sm hover:bg-brand/15 hover:border-brand/40 transition-all duration-300 cursor-default">
            <span className="w-2 h-2 rounded-full bg-success shadow-[0_0_8px_#00D68F] animate-pulse-dot" />
            <span className="text-[13px] font-medium text-brand-hover tracking-wide">
              Nền tảng xuất bản manga thế hệ mới
            </span>
          </div>

          {/* Heading — staggered text reveal */}
          <h1 className="font-primary text-[clamp(40px,5vw,72px)] font-extrabold leading-[1.1] tracking-tight text-text-primary">
            <span className="block overflow-hidden">
              <span className="block animate-text-reveal [animation-delay:0.15s]">Sáng tạo.</span>
            </span>
            <span className="block overflow-hidden">
              <span
                className="block bg-gradient-to-r from-brand via-secondary to-[#e84393] bg-clip-text text-transparent bg-[length:200%_200%]"
                style={{
                  animationName: 'text-reveal, gradient-shimmer',
                  animationDuration: '0.8s, 6s',
                  animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1), ease-in-out',
                  animationFillMode: 'both, none',
                  animationIterationCount: '1, infinite',
                  animationDelay: '0.3s, 0s',
                }}
              >
                Cộng tác.
              </span>
            </span>
            <span className="block overflow-hidden">
              <span className="block animate-text-reveal [animation-delay:0.45s]">Xuất bản.</span>
            </span>
          </h1>

          {/* Description */}
          <p className="animate-blur-in [animation-delay:0.55s] text-[clamp(16px,1.15vw,19px)] text-text-secondary leading-[1.7] max-w-[500px] mx-auto lg:mx-0 mt-1">
            Nền tảng Digital Workspace chuyên nghiệp kết nối Mangaka, Editor và Assistant — số hóa toàn bộ quy trình từ bản thảo đến xuất bản, quản lý tài chính minh bạch.
          </p>

          {/* CTA Buttons */}
          <div className="animate-fade-in-up [animation-delay:0.7s] flex gap-4 items-center flex-wrap justify-center lg:justify-start">
            <button
              className="group inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-br from-brand to-brand-hover text-white text-[15px] font-semibold border-none rounded-lg-custom cursor-pointer transition-all duration-300 shadow-brand hover:-translate-y-1 hover:shadow-[0_12px_35px_rgba(108,92,231,0.5)] active:translate-y-0 relative overflow-hidden"
              id="hero-cta-get-started"
              onClick={onGetStarted}
            >
              <span className="absolute inset-0 bg-gradient-to-br from-white/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              {/* Shimmer sweep effect */}
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
              {/* Pulsing border glow */}
              <span className="absolute -inset-[1px] rounded-lg-custom bg-gradient-to-r from-brand via-secondary to-brand bg-[length:200%_100%] opacity-0 group-hover:opacity-60 transition-opacity duration-300 -z-10 blur-sm animate-gradient-shimmer" />
              <span className="relative">Bắt đầu ngay</span>
              <svg
                className="relative transition-transform duration-300 group-hover:translate-x-1"
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
              className="group inline-flex items-center gap-2 px-7 py-3.5 bg-transparent text-text-primary text-[15px] font-medium border border-border-custom rounded-lg-custom cursor-pointer transition-all duration-300 hover:border-brand hover:text-brand-hover hover:bg-brand/5 hover:shadow-[0_0_20px_rgba(108,92,231,0.15)] relative overflow-hidden"
              id="hero-cta-learn-more"
              onClick={onLearnMore}
            >
              {/* Border shimmer effect */}
              <span className="absolute inset-0 rounded-lg-custom opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ boxShadow: 'inset 0 0 0 1px rgba(108,92,231,0.3)' }} />
              <svg
                className="transition-all duration-300 group-hover:scale-110 group-hover:text-brand"
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

          {/* Stats Row — animated counters */}
          <div className="animate-fade-in-up [animation-delay:0.85s] flex gap-8 pt-4 justify-center lg:justify-start">
            {[
              { end: 500, suffix: '+', label: 'Mangaka', delay: 1200 },
              { end: 2000, suffix: '+', label: 'Chapters', delay: 1400 },
              { end: 99.9, suffix: '%', label: 'Uptime', delay: 1600 },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className="flex flex-col gap-0.5 group cursor-default relative"
              >
                <span className="font-mono text-2xl font-bold text-text-primary transition-colors duration-300 group-hover:text-brand">
                  {stat.label === 'Uptime' ? '99.9%' : <AnimatedCounter end={stat.end} suffix={stat.suffix} delay={stat.delay} />}
                </span>
                <span className="text-[13px] text-text-muted tracking-wide transition-colors duration-300 group-hover:text-text-secondary">{stat.label}</span>
                {/* Hover underline glow */}
                <div className="absolute -bottom-1 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brand to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 scale-x-0 group-hover:scale-x-100" style={{ transition: 'opacity 0.3s, transform 0.4s' }} />
              </div>
            ))}
          </div>
        </div>

        {/* Right Visual — Hero Manga Illustration */}
        <div className="animate-scale-in [animation-delay:0.4s] relative flex justify-center items-center max-w-[560px] mx-auto lg:max-w-none">
          <div className="relative w-full">
            {/* Orbiting glow dots — multiple at different speeds */}
            <div className="absolute -inset-6 rounded-2xl opacity-30 animate-rotate-slow pointer-events-none" aria-hidden="true">
              <div className="absolute top-0 left-1/2 w-6 h-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/70 blur-md" />
              <div className="absolute bottom-0 left-1/2 w-4 h-4 -translate-x-1/2 translate-y-1/2 rounded-full bg-secondary/50 blur-md" />
            </div>
            <div className="absolute -inset-8 rounded-2xl opacity-20 pointer-events-none" aria-hidden="true" style={{ animation: 'rotate-slow 45s linear infinite reverse' }}>
              <div className="absolute top-1/2 right-0 w-5 h-5 translate-x-1/2 -translate-y-1/2 rounded-full bg-[#e84393]/50 blur-md" />
            </div>



            {/* Main Hero Image — Mangaka at work */}
            <div className="relative rounded-2xl overflow-hidden border border-brand/20 shadow-[0_20px_60px_rgba(108,92,231,0.25)] group hover:shadow-[0_25px_70px_rgba(108,92,231,0.35)] transition-all duration-500">
              <img
                src="/images/landing/hero-mangaka.png"
                alt="Mangaka creating manga on digital tablet"
                className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                loading="eager"
              />
              {/* Gradient overlay at bottom for blending */}
              <div className="absolute inset-0 bg-gradient-to-t from-bg-primary/60 via-transparent to-transparent" />
              {/* Animated top glow line */}
              <div className="absolute -top-2 -left-2 -right-2 h-1 bg-gradient-to-r from-transparent via-brand to-transparent blur-sm animate-glow-line" />
              {/* Bottom glow line */}
              <div className="absolute -bottom-1 left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-transparent via-secondary/50 to-transparent blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Corner accents */}
              <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-brand/30 rounded-tl-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-secondary/30 rounded-br-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
          </div>
        </div>
      </div>



      {/* CSS for progress bar animation */}
      <style>{`
        @keyframes progress-fill {
          from { width: 0%; }
          to { width: 78%; }
        }
      `}</style>
    </section>
  );
};
