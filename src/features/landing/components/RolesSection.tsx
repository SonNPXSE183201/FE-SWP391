import { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';

const roles = [
  {
    role: 'Mangaka',
    label: 'Tác giả manga',
    description: 'Sáng tác cốt truyện, thiết kế nhân vật, phác thảo storyboard. Quản lý series, phân công task cho Trợ lý vẽ và theo dõi tiến độ sản xuất.',
    image: '/images/landing/role-mangaka-studio.png',
    capabilities: ['Tạo & quản lý Series', 'Phân vùng Region', 'Giao Task cho Trợ lý vẽ', 'Quản lý Wallet & Fund'],
    accent: '#6C5CE7',
    gradient: 'from-[#6C5CE7] to-[#7C6EF0]',
    onboarding: { text: 'Liên hệ Hotline để hợp tác', link: 'tel:+84123456789' },
  },
  {
    role: 'Tantou Editor',
    label: 'Biên tập viên',
    description: 'Xét duyệt chất lượng bản thảo, sử dụng Canvas Annotation Tool để đánh dấu lỗi. Quản lý dispute và approve chapter để giải ngân tự động.',
    image: '/images/landing/role-editor-review.png',
    capabilities: ['Review trên Canvas', 'Annotation lỗi (QC)', 'Approve / Request Revision', 'Quản lý Genkoūryō'],
    accent: '#FFAA00',
    gradient: 'from-[#FFAA00] to-[#FFB833]',
    onboarding: { text: 'Tài khoản cấp nội bộ (Admin)', link: null },
  },
  {
    role: 'Assistant',
    label: 'Trợ lý vẽ Freelancer',
    description: 'Nhận task từ Mangaka, thực hiện inking, coloring, screentone theo yêu cầu. Nộp bài và nhận thanh toán tự động qua ví điện tử.',
    image: '/images/landing/role-assistant-work.png',
    capabilities: ['Nhận Task & Download assets', 'Upload TaskVersion', 'Quản lý Profile & Portfolio', 'Rút tiền về tài khoản'],
    accent: '#00CECE',
    gradient: 'from-[#00CECE] to-[#00E5E5]',
    onboarding: { text: 'Đăng ký Trợ lý vẽ tự do', link: '/register' },
  },
];

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const TiltCard = ({ children, className = '', style }: TiltCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `perspective(800px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) scale3d(1.02, 1.02, 1.02)`;
  }, []);

  const handleMouseLeave = useCallback(() => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = 'perspective(800px) rotateY(0deg) rotateX(0deg) scale3d(1, 1, 1)';
  }, []);

  return (
    <div
      ref={cardRef}
      className={`transition-transform duration-300 ease-out ${className}`}
      style={{ transformStyle: 'preserve-3d', ...style }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );
};

export const RolesSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [revealedCards, setRevealedCards] = useState<Set<number>>(new Set());

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

  // Stagger card reveals
  useEffect(() => {
    if (!isVisible) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    roles.forEach((_, i) => {
      timers.push(setTimeout(() => {
        setRevealedCards(prev => new Set(prev).add(i));
      }, 200 + i * 200));
    });
    return () => timers.forEach(clearTimeout);
  }, [isVisible]);

  return (
    <section
      ref={sectionRef}
      id="roles-section"
      className="py-24 bg-bg-primary relative overflow-hidden"
    >
      {/* Background accents */}
      <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-brand/5 rounded-full blur-[200px] pointer-events-none" />

      <div className="max-w-[1280px] mx-auto px-8 relative z-10">
        {/* Header */}
        <div className={`text-center max-w-2xl mx-auto mb-16 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-secondary/10 border border-secondary/25 rounded-full mb-6">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-secondary">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <span className="text-[13px] font-medium text-secondary tracking-wide">Vai trò</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
            Kết nối mọi{' '}
            <span className="bg-gradient-to-r from-brand via-warning to-secondary bg-clip-text text-transparent">
              vai trò sáng tạo
            </span>
          </h2>
          <p className="text-text-secondary text-lg">
            Mỗi vai trò có workspace riêng, được tối ưu hóa cho công việc chuyên môn — tất cả kết nối trên một nền tảng.
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {roles.map((role, index) => {
            const isRevealed = revealedCards.has(index);
            return (
              <TiltCard
                key={role.role}
                className={`transition-all duration-700 ease-out ${
                  isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                }`}
              >
                <div className="group relative bg-bg-secondary/50 border border-border-custom rounded-2xl overflow-hidden hover:border-transparent hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)] transition-all duration-500">
                  {/* Animated accent border glow */}
                  <div
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-20"
                    style={{
                      boxShadow: `inset 0 0 0 1px ${role.accent}40, 0 0 30px ${role.accent}15`,
                    }}
                  />

                  {/* Image header */}
                  <div className="relative h-[220px] overflow-hidden">
                    <img
                      src={role.image}
                      alt={`${role.role} — ${role.label}`}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-bg-secondary via-bg-secondary/40 to-transparent" />

                    {/* Role badge — animated entrance */}
                    <div
                      className={`absolute top-4 left-4 px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider uppercase backdrop-blur-md transition-all duration-500 ${
                        isRevealed ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'
                      }`}
                      style={{
                        color: role.accent,
                        backgroundColor: `${role.accent}20`,
                        border: `1px solid ${role.accent}40`,
                        transitionDelay: `${600 + index * 100}ms`,
                      }}
                    >
                      {role.role}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 pt-3 relative z-10">
                    <h3 className="text-xl font-bold text-text-primary mb-1 group-hover:text-brand-hover transition-colors duration-300">{role.label}</h3>
                    <p className="text-sm text-text-secondary leading-relaxed mb-5">{role.description}</p>

                    {/* Capabilities — staggered reveal */}
                    <div className="space-y-2.5">
                      {role.capabilities.map((cap, capIndex) => (
                        <div
                          key={cap}
                          className={`flex items-center gap-2.5 transition-all duration-500 ${
                            isRevealed ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
                          }`}
                          style={{ transitionDelay: `${700 + index * 100 + capIndex * 80}ms` }}
                        >
                          <div
                            className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110"
                            style={{ backgroundColor: `${role.accent}20` }}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={role.accent} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20,6 9,17 4,12"/>
                            </svg>
                          </div>
                          <span className="text-sm text-text-secondary">{cap}</span>
                        </div>
                      ))}
                    </div>
                    
                    {/* Onboarding Action */}
                    <div className={`mt-6 pt-5 border-t border-border-custom/50 transition-all duration-500 ${isRevealed ? 'opacity-100' : 'opacity-0'}`} style={{ transitionDelay: `${800 + index * 100}ms` }}>
                      {role.onboarding.link ? (
                        role.onboarding.link.startsWith('/') ? (
                          <Link to={role.onboarding.link} className="flex items-center justify-between group/action text-[13px] font-bold tracking-wide uppercase" style={{ color: role.accent }}>
                            <span>{role.onboarding.text}</span>
                            <svg className="w-4 h-4 transition-transform duration-300 group-hover/action:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                          </Link>
                        ) : (
                          <a href={role.onboarding.link} className="flex items-center justify-between group/action text-[13px] font-bold tracking-wide uppercase" style={{ color: role.accent }}>
                            <span>{role.onboarding.text}</span>
                            <svg className="w-4 h-4 transition-transform duration-300 group-hover/action:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                          </a>
                        )
                      ) : (
                        <div className="flex items-center gap-2 text-[13px] font-bold tracking-wide uppercase text-text-muted">
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                          <span>{role.onboarding.text}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bottom gradient line */}
                  <div
                    className="h-[3px] w-full opacity-0 group-hover:opacity-100 transition-all duration-500"
                    style={{ background: `linear-gradient(to right, transparent, ${role.accent}, transparent)` }}
                  />
                </div>
              </TiltCard>
            );
          })}
        </div>
      </div>
    </section>
  );
};
