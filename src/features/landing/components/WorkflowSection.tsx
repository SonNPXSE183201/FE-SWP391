import { useEffect, useRef, useState } from 'react';

const steps = [
  {
    number: '01',
    title: 'Sáng tác & Phác thảo',
    description: 'Mangaka tạo storyboard và phác thảo ý tưởng, xây dựng cốt truyện và thiết kế nhân vật cho series manga mới.',
    image: '/images/landing/manga-sketching.png',
    color: 'brand',
    accent: '#6C5CE7',
  },
  {
    number: '02',
    title: 'Phân công & Cộng tác',
    description: 'Phân chia regions, giao task cho Trợ lý vẽ xử lý inking, coloring, và screentone. Quản lý tiến độ real-time.',
    image: '/images/landing/assistant-coloring.png',
    color: 'secondary',
    accent: '#00CECE',
  },
  {
    number: '03',
    title: 'Xét duyệt & QC',
    description: 'Tantou Editor review bản thảo trên Canvas, annotation lỗi trực tiếp, gửi revision nếu cần chỉnh sửa.',
    image: '/images/landing/editor-review.png',
    color: 'warning',
    accent: '#FFAA00',
  },
  {
    number: '04',
    title: 'Xuất bản & Phát hành',
    description: 'Editorial Board bỏ phiếu duyệt, tự động giải ngân nhuận bút (Genkoūryō), và phát hành chapter chính thức.',
    image: '/images/landing/board-meeting.png',
    color: 'success',
    accent: '#00D68F',
  },
];

export const WorkflowSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [activeStep, setActiveStep] = useState(-1);

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
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // Stagger step reveals
  useEffect(() => {
    if (!isVisible) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    steps.forEach((_, i) => {
      timers.push(setTimeout(() => setActiveStep(i), 400 + i * 250));
    });
    return () => timers.forEach(clearTimeout);
  }, [isVisible]);

  return (
    <section
      ref={sectionRef}
      id="workflow-section"
      className="py-24 bg-bg-surface relative overflow-hidden border-t border-border-custom"
    >
      {/* Background glow */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-brand/5 rounded-full blur-[200px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[180px] pointer-events-none" />

      <div className="max-w-[1280px] mx-auto px-8 relative z-10">
        {/* Section Header */}
        <div className={`text-center max-w-2xl mx-auto mb-20 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand/10 border border-brand/25 rounded-full mb-6">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-brand">
              <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />
            </svg>
            <span className="text-[13px] font-medium text-brand-hover tracking-wide">Quy trình</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
            Từ ý tưởng đến{' '}
            <span className="bg-gradient-to-r from-brand via-secondary to-success bg-clip-text text-transparent">
              tác phẩm hoàn chỉnh
            </span>
          </h2>
          <p className="text-text-secondary text-lg">
            Quy trình sáng tác manga chuyên nghiệp được số hóa hoàn toàn — minh bạch, hiệu quả và liền mạch.
          </p>
        </div>

        {/* Workflow image banner */}
        <div
          className={`relative rounded-2xl overflow-hidden mb-20 border border-border-custom/40 shadow-[0_20px_60px_rgba(0,0,0,0.4)] transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-[0.97]'
            }`}
          style={{ transitionDelay: '200ms' }}
        >
          <img
            src="/images/landing/workflow-process.png"
            alt="Manga creation workflow from sketch to publication"
            className="w-full h-[200px] md:h-[300px] lg:h-[360px] object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-bg-primary/70 via-transparent to-bg-primary/70" />
          <div className="absolute inset-0 bg-gradient-to-t from-bg-surface/80 via-transparent to-transparent" />
        </div>

        {/* Steps Grid — with animated connecting line */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10 relative">
          {/* Connecting line between steps (desktop) */}
          <div className="hidden md:block absolute top-[65px] left-[65px] right-[65px] h-[2px] z-0 overflow-hidden" aria-hidden="true">
            <div
              className="h-full bg-gradient-to-r from-brand via-secondary via-warning to-success transition-all duration-1500 ease-out origin-left"
              style={{
                transform: `scaleX(${activeStep >= 3 ? 1 : activeStep >= 0 ? (activeStep + 1) / 4 : 0})`,
                transitionDuration: '1.5s',
                opacity: activeStep >= 0 ? 0.3 : 0,
              }}
            />
          </div>

          {steps.map((step, index) => {
            const isRevealed = activeStep >= index;
            const isFromLeft = index % 2 === 0;

            return (
              <div
                key={step.number}
                className={`group flex gap-5 md:gap-6 transition-all duration-700 ease-out relative z-10 ${isRevealed
                    ? 'opacity-100 translate-x-0 translate-y-0'
                    : `opacity-0 ${isFromLeft ? '-translate-x-8' : 'translate-x-8'} translate-y-4`
                  }`}
              >
                {/* Step image */}
                <div className="shrink-0 w-[100px] h-[100px] md:w-[130px] md:h-[130px] rounded-xl overflow-hidden border border-border-custom/50 shadow-lg-custom group-hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)] transition-all duration-500 group-hover:border-brand/40 relative">
                  <img
                    src={step.image}
                    alt={step.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  {/* Number overlay */}
                  <div
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm"
                    style={{ backgroundColor: `${step.accent}30` }}
                  >
                    <span className="text-3xl font-bold text-white/80">{step.number}</span>
                  </div>
                </div>

                {/* Step content */}
                <div className="flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className="text-xs font-bold tracking-widest uppercase px-2.5 py-1 rounded-md transition-all duration-300 group-hover:scale-105"
                      style={{
                        color: step.accent,
                        backgroundColor: `${step.accent}15`,
                        border: `1px solid ${step.accent}30`,
                        boxShadow: isRevealed ? `0 0 12px ${step.accent}20` : 'none',
                      }}
                    >
                      Bước {step.number}
                    </span>
                    {/* Animated dot connector */}
                    {index < steps.length - 1 && (
                      <div
                        className="hidden md:flex items-center gap-1 transition-opacity duration-500"
                        style={{ opacity: isRevealed ? 0.4 : 0 }}
                      >
                        {[0, 1, 2].map((d) => (
                          <div
                            key={d}
                            className="w-1 h-1 rounded-full"
                            style={{
                              backgroundColor: step.accent,
                              animation: isRevealed ? `pulse-dot 2s ease-in-out infinite ${d * 300}ms` : 'none',
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  <h3 className="text-lg md:text-xl font-semibold text-text-primary mb-2 group-hover:text-brand-hover transition-colors duration-300">
                    {step.title}
                  </h3>
                  <p className="text-sm md:text-[15px] text-text-secondary leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
