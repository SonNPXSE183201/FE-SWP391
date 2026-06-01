import { useEffect, useRef, useState, useCallback, type ReactNode } from 'react';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  image: string;
  imageAlt: string;
}

const FeatureCard = ({ title, description, icon, image, imageAlt }: FeatureCardProps) => (
  <div className="group flex-shrink-0 w-[340px] bg-bg-secondary/50 border border-border-custom rounded-xl-custom overflow-hidden transition-all duration-500 hover:border-brand/50 hover:bg-bg-secondary hover:-translate-y-2 hover:shadow-[0_20px_60px_rgba(108,92,231,0.15)]">
    {/* Card Image */}
    <div className="relative h-[200px] overflow-hidden">
      <img
        src={image}
        alt={imageAlt}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-bg-secondary via-bg-secondary/30 to-transparent" />
      {/* Hover shimmer overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
      {/* Icon badge overlay */}
      <div className="absolute bottom-4 left-5 w-12 h-12 rounded-lg-custom bg-brand/20 backdrop-blur-md border border-brand/30 text-brand flex items-center justify-center shadow-lg-custom group-hover:scale-110 group-hover:bg-brand/30 transition-all duration-300">
        {icon}
      </div>
    </div>

    {/* Card Content */}
    <div className="p-6 pt-4">
      <h3 className="text-xl font-semibold text-text-primary mb-3 group-hover:text-brand-hover transition-colors duration-300">{title}</h3>
      <p className="text-text-secondary leading-relaxed text-[15px]">{description}</p>
    </div>

    {/* Bottom glow line on hover */}
    <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-brand to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
  </div>
);

const FEATURES = [
  {
    title: 'Quản lý Bản thảo',
    description: 'Mangaka và Assistant dễ dàng upload, phân chia Task, và theo dõi tiến độ từng trang truyện theo thời gian thực.',
    image: '/images/landing/feature-manuscript.png',
    imageAlt: 'Manga manuscript management workspace',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  {
    title: 'Canvas Annotation Tool',
    description: 'Tantou Editor xét duyệt trực quan với công cụ khoanh vùng lỗi, ghim note trực tiếp trên trang truyện.',
    image: '/images/landing/feature-annotation.png',
    imageAlt: 'Canvas annotation tool for manga editing',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 19l7-7 3 3-7 7-3-3z" />
        <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
        <path d="M2 2l7.586 7.586" />
        <circle cx="11" cy="11" r="2" />
      </svg>
    ),
  },
  {
    title: 'Ví điện tử & Thanh toán',
    description: 'Quản lý Setup Fund, Lock/Unlock tiền linh hoạt. Tự động thanh toán Genkouryo ngay khi Editor duyệt.',
    image: '/images/landing/feature-wallet.png',
    imageAlt: 'Digital wallet and payment dashboard',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <line x1="2" y1="10" x2="22" y2="10" />
      </svg>
    ),
  },
  {
    title: 'Cộng tác thời gian thực',
    description: 'Mangaka, Editor và Assistant kết nối liền mạch trên cùng nền tảng với thông báo real-time qua SignalR.',
    image: '/images/landing/feature-collaboration.png',
    imageAlt: 'Real-time team collaboration on manga project',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    title: 'Bỏ phiếu & Xếp hạng',
    description: 'Editorial Board bỏ phiếu duyệt series, xếp hạng manga theo tiêu chí chất lượng để quyết định duy trì hoặc hủy.',
    image: '/images/landing/feature-voting.png',
    imageAlt: 'Editorial board voting and ranking system',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
  },
  {
    title: 'AI Auto-Composite',
    description: 'Tự động ghép ảnh khi tất cả Region trên trang hoàn thành. AI hỗ trợ phân tích panel và speech bubble.',
    image: '/images/landing/feature-ai-composite.png',
    imageAlt: 'AI-powered auto-composite for manga panels',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a4 4 0 0 0-4 4v2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2h-2V6a4 4 0 0 0-4-4z" />
        <circle cx="12" cy="15" r="2" />
        <path d="M12 13v4" />
      </svg>
    ),
  },
  {
    title: 'Quản lý Xuất bản',
    description: 'Theo dõi toàn bộ lifecycle của Series từ khởi tạo, duyệt chapter, đến phát hành chính thức trên nền tảng.',
    image: '/images/landing/feature-publishing.png',
    imageAlt: 'Manga publishing pipeline management',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        <line x1="12" y1="6" x2="12" y2="12" />
        <line x1="9" y1="9" x2="15" y2="9" />
      </svg>
    ),
  },
  {
    title: 'Phân công & Nghiệm thu',
    description: 'Mangaka tạo Task, chọn vùng cần vẽ, giao cho Assistant. Theo dõi version độc lập, nghiệm thu trực quan.',
    image: '/images/landing/feature-task-assign.png',
    imageAlt: 'Task assignment and region-based review',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="9" y1="21" x2="9" y2="9" />
      </svg>
    ),
  },
];

export const FeaturesSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Trigger header animation slightly before cards
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => setHeaderVisible(true), 100);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  // Check scroll position to toggle arrow visibility
  const updateScrollButtons = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }, []);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateScrollButtons, { passive: true });
    updateScrollButtons();
    // Recheck on resize
    window.addEventListener('resize', updateScrollButtons);
    return () => {
      el.removeEventListener('scroll', updateScrollButtons);
      window.removeEventListener('resize', updateScrollButtons);
    };
  }, [updateScrollButtons]);

  const scroll = useCallback((direction: 'left' | 'right') => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const cardWidth = 340 + 32; // card width + gap
    el.scrollBy({
      left: direction === 'left' ? -cardWidth : cardWidth,
      behavior: 'smooth',
    });
  }, []);

  // Auto-scroll: scroll one card every 3s, reverse at edges
  const autoDirectionRef = useRef<'left' | 'right'>('right');
  const pausedRef = useRef(false);
  const resumeTimerRef = useRef<number>();

  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      const el = scrollContainerRef.current;
      if (!el || pausedRef.current) return;

      const atEnd = el.scrollLeft >= el.scrollWidth - el.clientWidth - 10;
      const atStart = el.scrollLeft <= 10;

      if (atEnd) autoDirectionRef.current = 'left';
      if (atStart) autoDirectionRef.current = 'right';

      scroll(autoDirectionRef.current);
    }, 3000);

    return () => clearInterval(interval);
  }, [isVisible, scroll]);

  // Pause auto-scroll on hover / manual interaction, resume after 5s
  const pauseAutoScroll = useCallback(() => {
    pausedRef.current = true;
    if (resumeTimerRef.current) window.clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = window.setTimeout(() => {
      pausedRef.current = false;
    }, 5000);
  }, []);

  const handleManualScroll = useCallback((direction: 'left' | 'right') => {
    pauseAutoScroll();
    autoDirectionRef.current = direction;
    scroll(direction);
  }, [scroll, pauseAutoScroll]);

  return (
    <section ref={sectionRef} id="features-section" className="py-24 bg-bg-primary relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-brand/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-secondary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-[1280px] mx-auto px-8 relative z-10">
        {/* Header */}
        <div className={`text-center mx-auto mb-14 transition-all duration-700 ${headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand/10 border border-brand/25 rounded-full mb-6">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-brand">
              <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
            </svg>
            <span className="text-[13px] font-medium text-brand-hover tracking-wide">Tính năng</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4 whitespace-nowrap">
            Giải pháp toàn diện cho{' '}
            <span className="bg-gradient-to-r from-brand to-secondary bg-clip-text text-transparent">Digital Workspace</span>
          </h2>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            Hệ thống quản lý quy trình xuất bản tối ưu, từ lúc phác thảo ý tưởng đến khi phát hành, tất cả trên một nền tảng duy nhất.
          </p>
        </div>

        {/* Carousel container */}
        <div className="relative" onMouseEnter={pauseAutoScroll} onMouseLeave={() => { pausedRef.current = false; }}>
          {/* Left arrow */}
          <button
            onClick={() => handleManualScroll('left')}
            className={`absolute -left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-bg-surface/90 border border-border-custom backdrop-blur-md flex items-center justify-center text-text-secondary cursor-pointer transition-all duration-300 hover:bg-brand/20 hover:border-brand/50 hover:text-brand hover:scale-110 hover:shadow-[0_0_20px_rgba(108,92,231,0.3)] ${canScrollLeft ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            aria-label="Trượt trái"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          {/* Right arrow */}
          <button
            onClick={() => handleManualScroll('right')}
            className={`absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-bg-surface/90 border border-border-custom backdrop-blur-md flex items-center justify-center text-text-secondary cursor-pointer transition-all duration-300 hover:bg-brand/20 hover:border-brand/50 hover:text-brand hover:scale-110 hover:shadow-[0_0_20px_rgba(108,92,231,0.3)] ${canScrollRight ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            aria-label="Trượt phải"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>

          {/* Left fade edge */}
          <div className={`absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none transition-opacity duration-300 ${canScrollLeft ? 'opacity-100' : 'opacity-0'}`} style={{ background: 'linear-gradient(to right, #0F0F14, transparent)' }} />

          {/* Right fade edge */}
          <div className={`absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none transition-opacity duration-300 ${canScrollRight ? 'opacity-100' : 'opacity-0'}`} style={{ background: 'linear-gradient(to left, #0F0F14, transparent)' }} />

          {/* Scrollable cards */}
          <div
            ref={scrollContainerRef}
            className="flex gap-8 overflow-x-auto pb-4 scroll-smooth"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {/* Hide scrollbar for Chrome/Safari */}
            <style>{`
              #features-scroll::-webkit-scrollbar { display: none; }
            `}</style>
            {FEATURES.map((feature, i) => (
              <div
                key={feature.title}
                className={`transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: `${0.15 + i * 0.1}s` }}
              >
                <FeatureCard {...feature} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
