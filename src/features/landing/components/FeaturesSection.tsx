import type { ReactNode } from 'react';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  delay?: number;
}

const FeatureCard = ({ title, description, icon, delay = 0 }: FeatureCardProps) => (
  <div 
    className="bg-bg-secondary/50 border border-border-custom rounded-xl-custom p-6 transition-all duration-300 hover:border-brand/50 hover:bg-bg-secondary hover:-translate-y-1 hover:shadow-lg-custom"
    style={{ animationDelay: `${delay}s` }}
  >
    <div className="w-12 h-12 rounded-lg-custom bg-brand/10 text-brand flex items-center justify-center mb-5">
      {icon}
    </div>
    <h3 className="text-xl font-semibold text-text-primary mb-3">{title}</h3>
    <p className="text-text-secondary leading-relaxed text-[15px]">{description}</p>
  </div>
);

export const FeaturesSection = () => {
  return (
    <section id="features-section" className="py-24 bg-bg-primary relative overflow-hidden">
      <div className="max-w-[1280px] mx-auto px-8 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
            Giải pháp toàn diện cho <span className="text-brand">Digital Workspace</span>
          </h2>
          <p className="text-text-secondary text-lg">
            Hệ thống quản lý quy trình xuất bản tối ưu, từ lúc phác thảo ý tưởng đến khi phát hành, tất cả trên một nền tảng duy nhất.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard 
            title="Quản lý Bản thảo (Manuscript)"
            description="Mangaka và Assistant dễ dàng upload, phân chia Task, và theo dõi tiến độ từng trang truyện theo thời gian thực."
            delay={0.1}
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
            delay={0.2}
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
            delay={0.3}
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
