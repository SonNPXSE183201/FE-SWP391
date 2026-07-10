import { useEffect, useRef, useState } from 'react';

interface CTASectionProps {
  onAction: () => void;
}

export const CTASection = ({ onAction }: CTASectionProps) => {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-24 bg-bg-surface relative overflow-hidden border-t border-border-custom"
    >
      {/* Background decorations */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[300px] bg-brand/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Floating manga book decorations with parallax-like float */}
      <div className="absolute top-10 left-[5%] w-[180px] h-[240px] rounded-xl overflow-hidden opacity-[0.08] rotate-[-12deg] pointer-events-none hidden lg:block animate-float-card">
        <img
          src="/images/landing/published-volumes.png"
          alt=""
          className="w-full h-full object-cover"
          aria-hidden="true"
        />
      </div>
      <div className="absolute bottom-10 right-[5%] w-[200px] h-[260px] rounded-xl overflow-hidden opacity-[0.08] rotate-[8deg] pointer-events-none hidden lg:block animate-float-card [animation-delay:-3s]">
        <img
          src="/images/landing/manga-characters.png"
          alt=""
          className="w-full h-full object-cover"
          aria-hidden="true"
        />
      </div>
      <div className="absolute top-1/2 left-[12%] -translate-y-1/2 w-[140px] h-[180px] rounded-xl overflow-hidden opacity-[0.06] rotate-[-6deg] pointer-events-none hidden xl:block animate-float-card [animation-delay:-1.5s]">
        <img
          src="/images/landing/manga-panels.png"
          alt=""
          className="w-full h-full object-cover"
          aria-hidden="true"
        />
      </div>
      <div className="absolute top-1/2 right-[12%] -translate-y-1/2 w-[150px] h-[190px] rounded-xl overflow-hidden opacity-[0.06] rotate-[10deg] pointer-events-none hidden xl:block animate-float-card [animation-delay:-4.5s]">
        <img
          src="/images/landing/hero-mangaka.png"
          alt=""
          className="w-full h-full object-cover"
          aria-hidden="true"
        />
      </div>

      {/* Ambient particles */}
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={`cta-particle-${i}`}
          className="absolute rounded-full animate-float-particle pointer-events-none"
          aria-hidden="true"
          style={{
            width: `${4 + i * 2}px`,
            height: `${4 + i * 2}px`,
            left: `${20 + i * 20}%`,
            bottom: '-10px',
            backgroundColor: i % 2 === 0 ? '#6C5CE730' : '#00CECE30',
            animationDuration: `${10 + i * 4}s`,
            animationDelay: `${i * 3}s`,
          }}
        />
      ))}

      <div className="max-w-[800px] mx-auto px-8 relative z-10 text-center">
        {/* Published volumes image row — staggered entrance */}
        <div className="flex justify-center gap-3 mb-10">
          {[
            '/images/landing/manga-panels.png',
            '/images/landing/manga-characters.png',
            '/images/landing/published-volumes.png',
            '/images/landing/collaboration.png',
          ].map((src, i) => (
            <div
              key={src}
              className={`w-14 h-14 md:w-16 md:h-16 rounded-xl overflow-hidden border-2 border-border-custom/60 shadow-md-custom transition-all duration-500 hover:scale-110 hover:-translate-y-1 hover:border-brand/50 hover:shadow-[0_8px_20px_rgba(108,92,231,0.25)] ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
              style={{
                transform: isVisible
                  ? `rotate(${(i - 1.5) * 5}deg)`
                  : `rotate(${(i - 1.5) * 5}deg) translateY(24px)`,
                transitionDelay: `${i * 100}ms`,
              }}
            >
              <img
                src={src}
                alt=""
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          ))}
        </div>

        {/* Heading — blur-in reveal */}
        <h2 className={`text-3xl md:text-5xl font-bold text-text-primary mb-6 transition-all duration-800 ${
          isVisible ? 'opacity-100 translate-y-0 blur-0' : 'opacity-0 translate-y-6 blur-sm'
        }`} style={{ transitionDelay: '300ms', transitionDuration: '800ms' }}>
          Sẵn sàng cách mạng hóa{' '}
          <span className="bg-gradient-to-r from-brand via-secondary to-[#e84393] bg-clip-text text-transparent bg-[length:200%_200%] animate-gradient-shimmer">
            quy trình xuất bản?
          </span>
        </h2>

        {/* Description */}
        <p className={`text-text-secondary text-lg mb-10 max-w-[600px] mx-auto transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`} style={{ transitionDelay: '500ms' }}>
          Tham gia cùng hàng trăm Mangaka và Editor trên nền tảng quản lý chuyên nghiệp nhất.
        </p>

        {/* CTA Button — scale-in with glow */}
        <div className={`transition-all duration-700 ${
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
        }`} style={{ transitionDelay: '650ms' }}>
          <button
            onClick={onAction}
            className="group relative inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-br from-brand to-brand-hover text-white text-[16px] font-semibold border-none rounded-lg-custom cursor-pointer transition-all duration-300 shadow-brand hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(108,92,231,0.5)] overflow-hidden"
          >
            {/* Shimmer sweep */}
            <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
            {/* Pulsing glow ring */}
            <span className="absolute inset-0 rounded-lg-custom animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ boxShadow: '0 0 20px rgba(108, 92, 231, 0.4)' }} />
            <span className="relative">Trải nghiệm ngay</span>
            <svg
              className="relative transition-transform duration-300 group-hover:translate-x-1"
              width="20"
              height="20"
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
        </div>
      </div>
    </section>
  );
};
