import { useEffect, useRef, useState, useCallback } from 'react';

interface HeroSectionProps {
  onGetStarted?: () => void;
  onLearnMore?: () => void;
}



/** Typewriter text effect */
const TypewriterText = ({ text, delay = 0 }: { text: string; delay?: number }) => {
  const [displayed, setDisplayed] = useState('');
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(interval);
    }, 35);
    return () => clearInterval(interval);
  }, [started, text]);

  return (
    <span>
      {displayed}
      <span
        className="inline-block w-[2px] h-[1em] bg-brand ml-0.5 align-middle"
        style={{
          animation: started && displayed.length === text.length ? 'blink-cursor 1s step-end infinite' : 'none',
          opacity: started ? 1 : 0,
        }}
      />
    </span>
  );
};

/** Floating manga panel decoration */
const FloatingPanel = ({
  className,
  delay,
  children,
}: {
  className: string;
  delay: number;
  children?: React.ReactNode;
}) => (
  <div
    className={`absolute pointer-events-none ${className}`}
    style={{
      animationDelay: `${delay}s`,
    }}
  >
    {children}
  </div>
);

export const HeroSection = ({ onGetStarted, onLearnMore }: HeroSectionProps) => {
  const heroRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  // Entrance animation trigger
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // 3D tilt effect for card gallery
  const handleCardMouseMove = useCallback((e: React.MouseEvent) => {
    if (!cardsRef.current) return;
    const rect = cardsRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  }, []);

  const handleCardMouseLeave = useCallback(() => {
    setMousePos({ x: 0, y: 0 });
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
        className="absolute w-[500px] h-[500px] rounded-full pointer-events-none z-0 opacity-0 transition-opacity duration-700"
        style={{
          background: 'radial-gradient(circle, rgba(108, 92, 231, 0.06) 0%, rgba(0, 206, 206, 0.03) 40%, transparent 70%)',
          transform: 'translate(-50%, -50%)',
        }}
        aria-hidden="true"
      />

      {/* ═══ ANIMATED BACKGROUND ═══ */}
      <div className="absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
        {/* Morphing gradient orbs */}
        <div
          className="absolute w-[700px] h-[700px] -top-[15%] -right-[10%] rounded-full blur-[140px] opacity-30"
          style={{
            background: 'radial-gradient(circle, #6C5CE7 0%, #4834d4 40%, transparent 70%)',
            animation: 'morph-orb 25s ease-in-out infinite, float 20s ease-in-out infinite',
          }}
        />
        <div
          className="absolute w-[600px] h-[600px] -bottom-[20%] -left-[10%] rounded-full blur-[140px] opacity-25"
          style={{
            background: 'radial-gradient(circle, #00CECE 0%, #0097A7 40%, transparent 70%)',
            animation: 'morph-orb 30s ease-in-out infinite reverse, float 22s ease-in-out infinite reverse',
          }}
        />
        <div
          className="absolute w-[400px] h-[400px] top-[30%] left-[50%] rounded-full blur-[120px] opacity-15"
          style={{
            background: 'radial-gradient(circle, #e84393 0%, transparent 70%)',
            animation: 'morph-orb 20s ease-in-out infinite 5s',
          }}
        />

        {/* Dot matrix pattern */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: 'radial-gradient(circle, #F0F0F5 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />

        {/* Perspective grid floor */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[50%] opacity-[0.04]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(108,92,231,0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(108,92,231,0.5) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
            transform: 'perspective(500px) rotateX(60deg)',
            transformOrigin: 'center bottom',
            maskImage: 'linear-gradient(to top, black 0%, transparent 80%)',
            WebkitMaskImage: 'linear-gradient(to top, black 0%, transparent 80%)',
          }}
        />

        {/* Animated scan line */}
        <div
          className="absolute left-0 right-0 h-[1px] opacity-[0.06] pointer-events-none"
          style={{
            background: 'linear-gradient(90deg, transparent, #6C5CE7, #00CECE, transparent)',
            animation: 'scan-line 8s ease-in-out infinite',
          }}
        />

        {/* Floating manga speed lines */}
        <div
          className="absolute top-1/2 right-[20%] -translate-y-1/2 w-[900px] h-[900px] opacity-[0.03] pointer-events-none"
          style={{
            background: 'repeating-conic-gradient(transparent 0deg, transparent 3deg, rgba(108,92,231,0.4) 3.5deg, transparent 4deg)',
            maskImage: 'radial-gradient(circle, transparent 15%, black 35%, transparent 75%)',
            WebkitMaskImage: 'radial-gradient(circle, transparent 15%, black 35%, transparent 75%)',
            animation: 'rotate-slow 80s linear infinite',
          }}
        />

        {/* Floating particles — more organic feel */}
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={`particle-${i}`}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: `${1.5 + (i % 5) * 1.5}px`,
              height: `${1.5 + (i % 5) * 1.5}px`,
              left: `${3 + i * 6.5}%`,
              bottom: '-10px',
              backgroundColor: ['#6C5CE750', '#00CECE50', '#e8439350', '#00D68F50', '#FFAA0050'][i % 5],
              animation: `float-particle ${12 + (i % 6) * 3}s linear infinite`,
              animationDelay: `${i * 1.3}s`,
            }}
          />
        ))}
      </div>

      {/* ═══ DECORATIVE MANGA PANELS ═══ */}
      <FloatingPanel className="top-[12%] left-[5%] w-20 h-28 animate-float-card opacity-[0.08]" delay={0}>
        <div className="w-full h-full border border-brand/30 rounded-lg bg-brand/5 backdrop-blur-sm" />
      </FloatingPanel>
      <FloatingPanel className="top-[18%] right-[6%] w-14 h-14 animate-float-card opacity-[0.06]" delay={1.5}>
        <div className="w-full h-full border border-secondary/30 rounded-full bg-secondary/5" />
      </FloatingPanel>
      <FloatingPanel className="bottom-[25%] left-[3%] w-10 h-10 rotate-45 animate-float-card opacity-[0.07]" delay={3}>
        <div className="w-full h-full border border-[#e84393]/30 rounded-md bg-[#e84393]/5" />
      </FloatingPanel>
      <FloatingPanel className="bottom-[15%] right-[4%] w-16 h-24 animate-float-card opacity-[0.05]" delay={2}>
        <div className="w-full h-full border border-brand/20 rounded-lg bg-gradient-to-b from-brand/5 to-transparent" />
      </FloatingPanel>

      {/* ═══ MAIN CONTENT ═══ */}
      <div className="relative z-[1] w-full max-w-[1280px] mx-auto px-8 pt-28 pb-8 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        {/* ── LEFT: Text Content ── */}
        <div className="flex flex-col gap-5 text-center lg:text-left items-center lg:items-start">
          {/* Announcement Badge — pill with animated border */}
          <div
            className="relative inline-flex items-center gap-2.5 px-5 py-2 rounded-full w-fit cursor-default group"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(-20px)',
              transition: 'all 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.1s',
            }}
          >
            {/* Animated border */}
            <div
              className="absolute inset-0 rounded-full p-[1px] overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(108,92,231,0.5), rgba(0,206,206,0.3), rgba(108,92,231,0.2))',
                backgroundSize: '200% 200%',
                animation: 'gradient-shimmer 4s ease-in-out infinite',
              }}
            >
              <div className="w-full h-full rounded-full bg-bg-primary/90 backdrop-blur-xl" />
            </div>
            <span className="relative w-2 h-2 rounded-full bg-success shadow-[0_0_8px_#00D68F,0_0_16px_rgba(0,214,143,0.3)] animate-pulse-dot" />
            <span className="relative text-[13px] font-medium text-text-secondary tracking-wide">
              Nền tảng xuất bản manga thế hệ mới
            </span>
          </div>

          {/* ── MAIN HEADING ── */}
          <h1
            className="font-primary text-[clamp(42px,5.5vw,78px)] font-extrabold leading-[1.05] tracking-[-0.02em] text-text-primary"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
              filter: isVisible ? 'blur(0px)' : 'blur(8px)',
              transition: 'all 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.2s',
            }}
          >
            Manga{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: 'linear-gradient(135deg, #6C5CE7, #00CECE, #e84393, #6C5CE7)',
                backgroundSize: '300% 300%',
                animation: isVisible ? 'gradient-shimmer 5s ease-in-out infinite' : 'none',
              }}
            >
              Workspace
            </span>
            <span className="text-brand">.</span>
          </h1>

          {/* ── Subtitle — Typewriter effect ── */}
          <div
            className="max-w-[520px] mx-auto lg:mx-0"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
              transition: 'all 0.8s ease-out 0.9s',
            }}
          >
            <p className="text-[clamp(15px,1.1vw,18px)] text-text-secondary leading-[1.8]">
              <TypewriterText
                text="Digital Workspace chuyên nghiệp cho Mangaka, Editor và Trợ lý vẽ — quản lý quy trình từ bản thảo đến xuất bản, tài chính minh bạch trong từng giao dịch."
                delay={1100}
              />
            </p>
          </div>

          {/* ── CTA Buttons ── */}
          <div
            className="flex gap-4 items-center flex-wrap justify-center lg:justify-start mt-2"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(24px)',
              transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 1.1s',
            }}
          >
            {/* Primary CTA */}
            <button
              className="group relative inline-flex items-center gap-2.5 px-8 py-4 text-white text-[15px] font-semibold border-none rounded-xl cursor-pointer transition-all duration-400 overflow-hidden"
              id="hero-cta-get-started"
              onClick={onGetStarted}
              style={{
                background: 'linear-gradient(135deg, #6C5CE7, #7C6EF0)',
                boxShadow: '0 4px 24px rgba(108, 92, 231, 0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px) scale(1.02)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 40px rgba(108, 92, 231, 0.55), inset 0 1px 0 rgba(255,255,255,0.15)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0) scale(1)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 24px rgba(108, 92, 231, 0.4), inset 0 1px 0 rgba(255,255,255,0.1)';
              }}
            >
              {/* Shimmer sweep */}
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              {/* Glow border */}
              <span
                className="absolute -inset-[1px] rounded-xl opacity-0 group-hover:opacity-60 transition-opacity duration-500 -z-10 blur-sm"
                style={{
                  background: 'linear-gradient(135deg, #6C5CE7, #00CECE)',
                  backgroundSize: '200% 200%',
                  animation: 'gradient-shimmer 3s ease-in-out infinite',
                }}
              />
              <span className="relative">Bắt đầu ngay</span>
              <svg
                className="relative transition-transform duration-300 group-hover:translate-x-1.5"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </button>

            {/* Secondary CTA — Ghost button with animated border */}
            <button
              className="group relative inline-flex items-center gap-2.5 px-7 py-4 text-text-primary text-[15px] font-medium border-none rounded-xl cursor-pointer transition-all duration-400 bg-transparent overflow-hidden"
              id="hero-cta-learn-more"
              onClick={onLearnMore}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 30px rgba(108, 92, 231, 0.15)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLElement).style.boxShadow = 'none';
              }}
            >
              {/* Animated gradient border */}
              <span
                className="absolute inset-0 rounded-xl p-[1px]"
                style={{
                  background: 'linear-gradient(135deg, rgba(108,92,231,0.5), rgba(0,206,206,0.3), rgba(108,92,231,0.2))',
                  backgroundSize: '200% 200%',
                  animation: 'gradient-shimmer 4s ease-in-out infinite',
                }}
              >
                <span className="block w-full h-full rounded-[11px] bg-bg-primary group-hover:bg-bg-secondary/50 transition-colors duration-300" />
              </span>
              {/* Hover glow fill */}
              <span className="absolute inset-[1px] rounded-[11px] bg-brand/0 group-hover:bg-brand/5 transition-colors duration-300" />
              <svg
                className="relative transition-all duration-300 group-hover:scale-110 group-hover:text-brand"
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
              <span className="relative group-hover:text-brand transition-colors duration-300">Tìm hiểu thêm</span>
            </button>
          </div>
        </div>

        {/* ── RIGHT: Interactive 3D Card Gallery ── */}
        <div
          className="relative flex justify-center items-center"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateX(0)' : 'translateX(60px)',
            transition: 'all 1s cubic-bezier(0.16, 1, 0.3, 1) 0.5s',
            perspective: '1000px',
          }}
        >
          <div
            ref={cardsRef}
            className="relative w-full max-w-[520px] aspect-[4/3.3]"
            onMouseMove={handleCardMouseMove}
            onMouseLeave={handleCardMouseLeave}
            style={{
              transformStyle: 'preserve-3d',
              transform: `rotateY(${mousePos.x * 8}deg) rotateX(${-mousePos.y * 8}deg)`,
              transition: mousePos.x === 0 && mousePos.y === 0 ? 'transform 0.6s ease-out' : 'transform 0.1s ease-out',
            }}
          >
            <div
              className="relative w-full h-full rounded-2xl overflow-hidden group border border-brand/25"
              style={{
                boxShadow: '0 25px 60px rgba(108, 92, 231, 0.25), 0 8px 20px rgba(0, 0, 0, 0.3)',
              }}
            >
              <img
                src="/images/landing/hero-mangaka.png"
                alt="Mangaka creating manga on digital workspace"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                loading="eager"
              />

              {/* Animated glow line at top */}
              <div
                className="absolute -top-1 left-0 right-0 h-[2px] blur-sm animate-glow-line"
                style={{
                  background: 'linear-gradient(90deg, transparent, #6C5CE7, #00CECE, transparent)',
                }}
              />

              {/* Corner decorations on hover */}
              <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-brand/40 rounded-tl-lg opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:w-12 group-hover:h-12" />
              <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-secondary/40 rounded-tr-lg opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:w-12 group-hover:h-12" />
              <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-secondary/40 rounded-bl-lg opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:w-12 group-hover:h-12" />
              <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-brand/40 rounded-br-lg opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:w-12 group-hover:h-12" />

            </div>

            {/* Orbiting glow accents */}
            <div
              className="absolute -inset-8 pointer-events-none"
              style={{ animation: 'rotate-slow 40s linear infinite' }}
            >
              <div className="absolute top-0 left-1/2 w-5 h-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/50 blur-md" />
              <div className="absolute bottom-0 left-1/2 w-3 h-3 -translate-x-1/2 translate-y-1/2 rounded-full bg-secondary/40 blur-md" />
            </div>
            <div
              className="absolute -inset-12 pointer-events-none"
              style={{ animation: 'rotate-slow 55s linear infinite reverse' }}
            >
              <div className="absolute top-1/2 right-0 w-4 h-4 translate-x-1/2 -translate-y-1/2 rounded-full bg-[#e84393]/30 blur-md" />
            </div>
          </div>
        </div>
      </div>



      {/* ═══ CUSTOM KEYFRAMES ═══ */}
      <style>{`
        @keyframes morph-orb {
          0%, 100% {
            border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
            transform: translate(0, 0) rotate(0deg);
          }
          25% {
            border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%;
          }
          50% {
            border-radius: 50% 60% 30% 60% / 30% 40% 70% 50%;
            transform: translate(20px, -20px) rotate(5deg);
          }
          75% {
            border-radius: 60% 30% 50% 40% / 60% 50% 40% 30%;
          }
        }

        @keyframes scan-line {
          0% { top: -2%; }
          100% { top: 102%; }
        }

        @keyframes blink-cursor {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }

        @keyframes rotate-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </section>
  );
};
