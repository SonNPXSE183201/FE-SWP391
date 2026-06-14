import { useEffect, useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';

interface NavbarProps {
}

const NAV_LINKS = [
  { label: 'Tính năng', targetId: 'features-section' },
  { label: 'Quy trình', targetId: 'workflow-section' },
  { label: 'Vai trò', targetId: 'roles-section' },
  { label: 'Showcase', targetId: 'showcase-section' },
];

export const Navbar = ({}: NavbarProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const ticking = useRef(false);

  // Detect scroll to toggle between transparent ↔ glassmorphism
  const handleScroll = useCallback(() => {
    if (ticking.current) return;
    ticking.current = true;
    requestAnimationFrame(() => {
      setIsScrolled(window.scrollY > 50);
      ticking.current = false;
    });
  }, []);

  // Track active section via IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0 }
    );

    // Also observe hero to clear active state when at top
    const heroEl = document.getElementById('hero-section');
    if (heroEl) observer.observe(heroEl);

    NAV_LINKS.forEach((link) => {
      const el = document.getElementById(link.targetId);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const scrollToSection = useCallback((targetId: string) => {
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setIsMobileMenuOpen(false);
    }
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsMobileMenuOpen(false);
  }, []);

  return (
    <nav
      id="landing-navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${isScrolled
          ? 'bg-bg-primary/75 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.4)]'
          : 'bg-transparent'
        }`}
    >
      {/* Bottom border — only visible when scrolled */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-[1px] transition-opacity duration-500 ${isScrolled ? 'opacity-100' : 'opacity-0'
          }`}
        style={{
          background: 'linear-gradient(90deg, transparent 5%, rgba(108,92,231,0.25) 30%, rgba(0,206,206,0.15) 70%, transparent 95%)',
        }}
      />

      <div className="max-w-[1280px] mx-auto px-8 h-[72px] flex items-center justify-between relative">
        {/* Logo */}
        <button
          onClick={scrollToTop}
          className="flex items-center gap-2.5 group cursor-pointer bg-transparent border-none p-0"
          aria-label="Scroll to top"
        >
          <div className="w-9 h-9 relative transition-transform duration-300 group-hover:scale-110">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 48 48" fill="none">
              <defs>
                <linearGradient id="navLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#6C5CE7', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: '#00CECE', stopOpacity: 1 }} />
                </linearGradient>
                <linearGradient id="navInkDrop" x1="50%" y1="0%" x2="50%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#8B7CF0', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: '#6C5CE7', stopOpacity: 1 }} />
                </linearGradient>
                <linearGradient id="navNibGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#00CECE', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: '#00A5A5', stopOpacity: 1 }} />
                </linearGradient>
              </defs>
              <rect x="1" y="1" width="46" height="46" rx="14" fill="#0F0F12" />
              <rect x="1" y="1" width="46" height="46" rx="14" stroke="url(#navLogoGrad)" strokeWidth="1.5" fill="none" opacity="0.35" />
              {/* Ink drop */}
              <path d="M24 8 C24 8, 14 20, 14 27 C14 32.5 18.5 37 24 37 C29.5 37 34 32.5 34 27 C34 20 24 8 24 8Z" fill="url(#navInkDrop)" opacity="0.9" />
              <ellipse cx="20" cy="24" rx="3.5" ry="5" fill="white" opacity="0.1" transform="rotate(-15 20 24)" />
              {/* Pen nib */}
              <path d="M24 6 L27 14 L24 12.5 L21 14 Z" fill="url(#navNibGrad)" opacity="0.95" />
              {/* Panel lines */}
              <line x1="18" y1="26" x2="30" y2="26" stroke="white" strokeWidth="0.6" opacity="0.15" />
              <line x1="24" y1="22" x2="24" y2="33" stroke="white" strokeWidth="0.6" opacity="0.12" />
              {/* Sparkles */}
              <circle cx="31" cy="15" r="1.2" fill="#00CECE" opacity="0.7" />
              <circle cx="15" cy="18" r="0.8" fill="#6C5CE7" opacity="0.5" />
            </svg>
          </div>
          <span className="text-lg font-bold tracking-tight group-hover:text-brand transition-colors duration-300">
            <span className="text-text-primary">Ink</span>
            <span className="bg-gradient-to-r from-brand to-secondary bg-clip-text text-transparent">u</span>
          </span>
        </button>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-2">
          {NAV_LINKS.map((link) => {
            const isActive = activeSection === link.targetId;
            return (
              <button
                key={link.targetId}
                onClick={() => scrollToSection(link.targetId)}
                className={`relative px-4 py-2 text-[14px] font-medium rounded-lg transition-all duration-300 cursor-pointer bg-transparent border-none ${isActive
                    ? 'text-brand'
                    : 'text-text-secondary hover:text-text-primary hover:bg-white/[0.04]'
                  }`}
              >
                {link.label}
                {/* Active underline glow */}
                <span
                  className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] rounded-full bg-brand transition-all duration-300 ${isActive ? 'w-4 opacity-100' : 'w-0 opacity-0'
                    }`}
                />
              </button>
            );
          })}
        </div>

        {/* Auth Buttons + Mobile hamburger */}
        <div className="flex items-center gap-3">
          {/* Login — ghost style */}
          <Link
            to="/login"
            className="hidden sm:inline-flex items-center px-4 py-2 text-text-secondary text-[13px] font-medium rounded-lg transition-all duration-300 hover:text-text-primary hover:bg-white/[0.04] relative group"
            id="navbar-cta-login"
          >
            <span className="relative">Đăng nhập</span>
          </Link>

          {/* Register — primary CTA */}
          <Link
            to="/register"
            className="hidden sm:inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-br from-brand to-brand-hover text-white text-[13px] font-semibold border-none rounded-lg cursor-pointer transition-all duration-300 shadow-brand hover:-translate-y-0.5 hover:shadow-brand-hover active:translate-y-0 relative overflow-hidden group"
            id="navbar-cta-register"
          >
            <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
            <span className="relative">Đăng ký Trợ lý vẽ</span>
            <svg
              className="relative w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5"
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
          </Link>

          {/* Mobile hamburger */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden flex flex-col gap-1.5 p-2 bg-transparent border-none cursor-pointer group"
            aria-label="Toggle mobile menu"
            aria-expanded={isMobileMenuOpen}
          >
            <span
              className={`block w-5 h-[2px] rounded-full transition-all duration-300 origin-center ${isScrolled ? 'bg-text-secondary group-hover:bg-text-primary' : 'bg-text-primary/70 group-hover:bg-text-primary'
                } ${isMobileMenuOpen ? 'rotate-45 translate-y-[5px]' : ''}`}
            />
            <span
              className={`block w-5 h-[2px] rounded-full transition-all duration-300 ${isScrolled ? 'bg-text-secondary group-hover:bg-text-primary' : 'bg-text-primary/70 group-hover:bg-text-primary'
                } ${isMobileMenuOpen ? 'opacity-0 scale-x-0' : ''}`}
            />
            <span
              className={`block w-5 h-[2px] rounded-full transition-all duration-300 origin-center ${isScrolled ? 'bg-text-secondary group-hover:bg-text-primary' : 'bg-text-primary/70 group-hover:bg-text-primary'
                } ${isMobileMenuOpen ? '-rotate-45 -translate-y-[5px]' : ''}`}
            />
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      <div
        className={`md:hidden absolute top-full left-0 right-0 bg-bg-primary/95 backdrop-blur-xl border-b border-border-custom/50 transition-all duration-300 overflow-hidden ${isMobileMenuOpen ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'
          }`}
      >
        <div className="px-8 py-4 flex flex-col gap-1">
          {NAV_LINKS.map((link, index) => (
            <button
              key={link.targetId}
              onClick={() => scrollToSection(link.targetId)}
              className={`text-left px-4 py-3 text-[15px] font-medium rounded-lg transition-all duration-300 cursor-pointer bg-transparent border-none ${activeSection === link.targetId
                  ? 'text-brand bg-brand/10'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-secondary/50'
                }`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {link.label}
            </button>
          ))}
          <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-border-custom/30">
            <Link
              to="/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="sm:hidden px-4 py-3 text-text-secondary text-[14px] font-medium rounded-lg hover:text-text-primary hover:bg-bg-secondary/50 transition-all duration-300 text-center no-underline"
            >
              Đăng nhập
            </Link>
            <Link
              to="/register"
              onClick={() => setIsMobileMenuOpen(false)}
              className="sm:hidden px-4 py-3 bg-gradient-to-br from-brand to-brand-hover text-white text-[14px] font-semibold border-none rounded-lg transition-all duration-300 text-center no-underline"
            >
              Đăng ký Trợ lý vẽ →
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};
