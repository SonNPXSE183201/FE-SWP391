import { useCallback } from 'react';
import { Link } from 'react-router-dom';

const FOOTER_NAV = [
  {
    title: 'Sản phẩm',
    links: [
      { label: 'Tính năng', targetId: 'features-section' },
      { label: 'Quy trình', targetId: 'workflow-section' },
      { label: 'Vai trò', targetId: 'roles-section' },
      { label: 'Showcase', targetId: 'showcase-section' },
    ],
  },
  {
    title: 'Tài khoản',
    links: [
      { label: 'Đăng nhập', route: '/login' },
      { label: 'Đăng ký Trợ lý vẽ', route: '/register' },
    ],
  },
  {
    title: 'Tài nguyên',
    links: [
      { label: 'Tài liệu API', href: '#' },
      { label: 'Hướng dẫn', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Changelog', href: '#' },
    ],
  },
  {
    title: 'Hỗ trợ',
    links: [
      { label: 'Liên hệ (contact@inku.vn)', href: 'mailto:contact@inku.vn' },
      { label: 'FAQ', href: '#' },
      { label: 'Cộng đồng', href: '#' },
      { label: 'Trạng thái hệ thống', href: '#' },
    ],
  },
  {
    title: 'Pháp lý',
    links: [
      { label: 'Điều khoản sử dụng', href: '#' },
      { label: 'Chính sách bảo mật', href: '#' },
      { label: 'Cookie', href: '#' },
    ],
  },
];

const SOCIAL_LINKS = [
  {
    label: 'Twitter',
    href: '#',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
      </svg>
    ),
  },
  {
    label: 'GitHub',
    href: '#',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
        <path d="M9 18c-4.51 2-5-2-7-2" />
      </svg>
    ),
  },
  {
    label: 'Discord',
    href: '#',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8.12 9.29c-.87 0-1.57.74-1.57 1.65s.7 1.65 1.57 1.65c.87 0 1.57-.74 1.57-1.65s-.7-1.65-1.57-1.65z" />
        <path d="M15.92 9.29c-.87 0-1.57.74-1.57 1.65s.7 1.65 1.57 1.65c.87 0 1.57-.74 1.57-1.65s-.7-1.65-1.57-1.65z" />
        <path d="M20.16 5.47a18.28 18.28 0 0 0-4.56-1.42 12.54 12.54 0 0 0-.57 1.17 16.9 16.9 0 0 0-5.06 0 12.54 12.54 0 0 0-.57-1.17 18.28 18.28 0 0 0-4.56 1.42A19.76 19.76 0 0 0 1.54 18.5a18.42 18.42 0 0 0 5.63 2.85 13.11 13.11 0 0 0 1.15-1.87 11.89 11.89 0 0 1-1.81-.87c.15-.11.3-.23.44-.35a13.17 13.17 0 0 0 11.1 0c.14.12.29.24.44.35a11.89 11.89 0 0 1-1.81.87 13.11 13.11 0 0 0 1.15 1.87 18.42 18.42 0 0 0 5.63-2.85A19.76 19.76 0 0 0 20.16 5.47z" />
      </svg>
    ),
  },
  {
    label: 'YouTube',
    href: '#',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
        <path d="m10 15 5-3-5-3z" />
      </svg>
    ),
  },
];

export const Footer = () => {
  const scrollToSection = useCallback((targetId: string) => {
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <footer id="landing-footer" className="relative bg-bg-primary overflow-hidden">
      {/* ═══ TOP GLOW BORDER ═══ */}
      <div className="relative h-px" aria-hidden="true">
        <div
          className="absolute inset-0 animate-glow-line"
          style={{
            background:
              'linear-gradient(90deg, transparent, #6C5CE7, #00CECE, #6C5CE7, transparent)',
            backgroundSize: '200% 100%',
          }}
        />
        <div
          className="absolute inset-0 blur-md opacity-60"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(108, 92, 231, 0.4), transparent)',
          }}
        />
      </div>

      {/* ═══ BACKGROUND DECORATIONS ═══ */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {/* Gradient orb — bottom left */}
        <div
          className="absolute -bottom-[20%] -left-[10%] w-[500px] h-[500px] rounded-full blur-[160px] opacity-[0.08]"
          style={{ background: 'radial-gradient(circle, #6C5CE7, transparent 70%)' }}
        />
        {/* Gradient orb — bottom right */}
        <div
          className="absolute -bottom-[15%] -right-[8%] w-[400px] h-[400px] rounded-full blur-[140px] opacity-[0.06]"
          style={{ background: 'radial-gradient(circle, #00CECE, transparent 70%)' }}
        />
        {/* Dot matrix */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: 'radial-gradient(circle, #F0F0F5 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
      </div>

      {/* ═══ MAIN FOOTER CONTENT ═══ */}
      <div className="relative z-10 max-w-[1280px] mx-auto px-8 pt-16 pb-8">
        {/* TOP ROW: Logo + Newsletter */}
        <div className="flex flex-col lg:flex-row justify-between gap-12 mb-14">
          {/* Brand column */}
          <div className="max-w-[360px]">
            {/* Logo */}
            <button
              onClick={scrollToTop}
              className="flex items-center gap-2.5 group cursor-pointer bg-transparent border-none p-0 mb-5"
              aria-label="Scroll to top"
            >
              <div className="w-9 h-9 relative transition-transform duration-300 group-hover:scale-110">
                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 48 48" fill="none">
                  <defs>
                    <linearGradient id="ftLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{ stopColor: '#6C5CE7', stopOpacity: 1 }} />
                      <stop offset="100%" style={{ stopColor: '#00CECE', stopOpacity: 1 }} />
                    </linearGradient>
                    <linearGradient id="ftInkDrop" x1="50%" y1="0%" x2="50%" y2="100%">
                      <stop offset="0%" style={{ stopColor: '#8B7CF0', stopOpacity: 1 }} />
                      <stop offset="100%" style={{ stopColor: '#6C5CE7', stopOpacity: 1 }} />
                    </linearGradient>
                    <linearGradient id="ftNibGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{ stopColor: '#00CECE', stopOpacity: 1 }} />
                      <stop offset="100%" style={{ stopColor: '#00A5A5', stopOpacity: 1 }} />
                    </linearGradient>
                  </defs>
                  <rect x="1" y="1" width="46" height="46" rx="14" fill="#0F0F12" />
                  <rect x="1" y="1" width="46" height="46" rx="14" stroke="url(#ftLogoGrad)" strokeWidth="1.5" fill="none" opacity="0.35" />
                  <path d="M24 8 C24 8, 14 20, 14 27 C14 32.5 18.5 37 24 37 C29.5 37 34 32.5 34 27 C34 20 24 8 24 8Z" fill="url(#ftInkDrop)" opacity="0.9" />
                  <ellipse cx="20" cy="24" rx="3.5" ry="5" fill="white" opacity="0.1" transform="rotate(-15 20 24)" />
                  <path d="M24 6 L27 14 L24 12.5 L21 14 Z" fill="url(#ftNibGrad)" opacity="0.95" />
                  <line x1="18" y1="26" x2="30" y2="26" stroke="white" strokeWidth="0.6" opacity="0.15" />
                  <line x1="24" y1="22" x2="24" y2="33" stroke="white" strokeWidth="0.6" opacity="0.12" />
                  <circle cx="31" cy="15" r="1.2" fill="#00CECE" opacity="0.7" />
                  <circle cx="15" cy="18" r="0.8" fill="#6C5CE7" opacity="0.5" />
                </svg>
              </div>
              <span className="text-lg font-bold tracking-tight group-hover:text-brand transition-colors duration-300">
                <span className="text-text-primary">Ink</span>
                <span className="bg-gradient-to-r from-brand to-secondary bg-clip-text text-transparent">u</span>
              </span>
            </button>

            <p className="text-text-secondary text-[14px] leading-relaxed mb-4">
              Nền tảng quản lý quy trình sáng tác và xuất bản manga chuyên nghiệp — kết nối Mangaka, Editor và Trợ lý vẽ trên cùng một workspace.
            </p>

            {/* Contact Information for Mangaka / General Inquiries */}
            <div className="flex flex-col gap-2.5 mb-6">
              <a href="mailto:contact@inku.vn" className="text-text-secondary text-[14px] hover:text-brand transition-colors duration-300 flex items-center gap-2 w-fit">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="16" x="2" y="4" rx="2"/>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
                contact@inku.vn
              </a>
              <a href="tel:+84123456789" className="text-text-secondary text-[14px] hover:text-brand transition-colors duration-300 flex items-center gap-2 w-fit">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                +84 (0) 123 456 789
              </a>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-2">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="group relative w-9 h-9 flex items-center justify-center rounded-lg text-text-muted hover:text-text-primary transition-all duration-300 bg-transparent hover:bg-white/[0.05]"
                >
                  {/* Hover glow */}
                  <span className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ boxShadow: '0 0 12px rgba(108, 92, 231, 0.15)' }} />
                  <span className="relative transition-transform duration-300 group-hover:scale-110">
                    {social.icon}
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* Navigation columns */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 lg:gap-12">
            {FOOTER_NAV.map((group) => (
              <div key={group.title}>
                <h4 className="text-text-primary text-[13px] font-semibold uppercase tracking-[0.08em] mb-4">
                  {group.title}
                </h4>
                <ul className="list-none p-0 m-0 flex flex-col gap-2.5">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      {'targetId' in link && link.targetId ? (
                        <button
                          onClick={() => scrollToSection(link.targetId!)}
                          className="text-text-secondary text-[13px] hover:text-brand transition-colors duration-300 cursor-pointer bg-transparent border-none p-0 text-left"
                        >
                          {link.label}
                        </button>
                      ) : 'route' in link && link.route ? (
                        <Link
                          to={link.route}
                          className="text-text-secondary text-[13px] hover:text-brand transition-colors duration-300 no-underline"
                        >
                          {link.label}
                        </Link>
                      ) : (
                        <a
                          href={'href' in link ? link.href : '#'}
                          className="text-text-secondary text-[13px] hover:text-brand transition-colors duration-300 no-underline"
                        >
                          {link.label}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>




        {/* ═══ BOTTOM BAR ═══ */}
        <div className="relative">
          {/* Separator */}
          <div
            className="h-px mb-6"
            style={{
              background: 'linear-gradient(90deg, transparent 5%, rgba(108,92,231,0.15) 30%, rgba(0,206,206,0.1) 70%, transparent 95%)',
            }}
          />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Copyright */}
            <p className="text-text-muted text-[12px]">
              © {new Date().getFullYear()} Inku. Đây là dự án học tập — không phục vụ mục đích thương mại.
            </p>

            {/* Status + Version */}
            <div className="flex items-center gap-4">
              {/* System status indicator */}
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-success shadow-[0_0_6px_#00D68F] animate-pulse" />
                <span className="text-text-muted text-[12px]">Hệ thống hoạt động ổn định</span>
              </div>

              <span className="text-border-custom text-[12px]">•</span>

              {/* Version */}
              <span className="text-text-muted text-[12px] font-mono">v1.0.0</span>
            </div>


          </div>
        </div>
      </div>

      {/* ═══ BOTTOM GLOW EDGE ═══ */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[1px] opacity-30"
        aria-hidden="true"
        style={{
          background: 'linear-gradient(90deg, transparent, #6C5CE7, #00CECE, transparent)',
        }}
      />
    </footer>
  );
};
