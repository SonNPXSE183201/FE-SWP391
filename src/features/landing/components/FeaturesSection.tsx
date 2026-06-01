import { useEffect, useRef, useState, type ReactNode } from 'react';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  image: string;
  imageAlt: string;
  delay?: number;
  isVisible?: boolean;
}

const FeatureCard = ({ title, description, icon, image, imageAlt, delay = 0, isVisible = false }: FeatureCardProps) => (
  <div
    className={`group bg-bg-secondary/50 border border-border-custom rounded-xl-custom overflow-hidden transition-all duration-500 hover:border-brand/50 hover:bg-bg-secondary hover:-translate-y-2 hover:shadow-[0_20px_60px_rgba(108,92,231,0.15)] ${
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
    }`}
    style={{ transitionDelay: `${delay}s` }}
  >
    {/* Card Image */}
    <div className="relative h-[200px] overflow-hidden">
      <img
        src={image}
        alt={imageAlt}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-bg-secondary via-bg-secondary/30 to-transparent" />
      {/* Icon badge overlay */}
      <div className="absolute bottom-4 left-5 w-12 h-12 rounded-lg-custom bg-brand/20 backdrop-blur-md border border-brand/30 text-brand flex items-center justify-center shadow-lg-custom group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
    </div>

    {/* Card Content */}
    <div className="p-6 pt-4">
      <h3 className="text-xl font-semibold text-text-primary mb-3 group-hover:text-brand-hover transition-colors duration-300">{title}</h3>
      <p className="text-text-secondary leading-relaxed text-[15px]">{description}</p>
    </div>
  </div>
);

export const FeaturesSection = () => {
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
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} id="features-section" className="py-24 bg-bg-primary relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-brand/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-secondary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-[1280px] mx-auto px-8 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand/10 border border-brand/25 rounded-full mb-6">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-brand">
              <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
            </svg>
            <span className="text-[13px] font-medium text-brand-hover tracking-wide">Tính năng</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
            Giải pháp toàn diện cho{' '}
            <span className="bg-gradient-to-r from-brand to-secondary bg-clip-text text-transparent">Digital Workspace</span>
          </h2>
          <p className="text-text-secondary text-lg">
            Hệ thống quản lý quy trình xuất bản tối ưu, từ lúc phác thảo ý tưởng đến khi phát hành, tất cả trên một nền tảng duy nhất.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            title="Quản lý Bản thảo (Manuscript)"
            description="Mangaka và Assistant dễ dàng upload, phân chia Task, và theo dõi tiến độ từng trang truyện theo thời gian thực."
            image="/images/landing/manga-sketching.png"
            imageAlt="Manga sketching and manuscript creation"
            delay={0.1}
            isVisible={isVisible}
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <line x1="10" y1="9" x2="8" y2="9"/>
              </svg>
            }
          />
          <FeatureCard
            title="Canvas Annotation Tool"
            description="Tantou Editor xét duyệt trực quan với công cụ khoanh vùng lỗi, ghim note trực tiếp trên trang truyện (Technical, Art, Content)."
            image="/images/landing/editor-review.png"
            imageAlt="Editor reviewing manga with annotations"
            delay={0.2}
            isVisible={isVisible}
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 19l7-7 3 3-7 7-3-3z"/>
                <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
                <path d="M2 2l7.586 7.586"/>
                <circle cx="11" cy="11" r="2"/>
              </svg>
            }
          />
          <FeatureCard
            title="Ví điện tử & Thanh toán tự động"
            description="Quản lý Setup Fund, Lock/Unlock tiền linh hoạt. Tự động thanh toán Genkouryo ngay khi Editor duyệt bản thảo."
            image="/images/landing/workspace.png"
            imageAlt="Digital workspace with wallet and payment management"
            delay={0.3}
            isVisible={isVisible}
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="5" width="20" height="14" rx="2"/>
                <line x1="2" y1="10" x2="22" y2="10"/>
              </svg>
            }
          />
        </div>
      </div>
    </section>
  );
};
