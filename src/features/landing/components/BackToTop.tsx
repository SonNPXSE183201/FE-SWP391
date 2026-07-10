import { useEffect, useState, useCallback, useRef } from 'react';

/**
 * Fixed back-to-top button that appears after scrolling past the hero section.
 * Positioned bottom-right with smooth entrance/exit animation.
 */
export const BackToTop = () => {
  const [isVisible, setIsVisible] = useState(false);
  const ticking = useRef(false);

  const handleScroll = useCallback(() => {
    if (ticking.current) return;
    ticking.current = true;
    requestAnimationFrame(() => {
      setIsVisible(window.scrollY > 600);
      ticking.current = false;
    });
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <button
      onClick={scrollToTop}
      aria-label="Back to top"
      id="landing-back-to-top"
      className={`fixed bottom-8 right-8 z-50 group w-11 h-11 flex items-center justify-center rounded-xl border border-border-custom/60 cursor-pointer transition-all duration-500 ease-out ${
        isVisible
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
      style={{
        background: 'rgba(15, 15, 20, 0.75)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(108, 92, 231, 0.08)',
      }}
    >
      {/* Hover glow ring */}
      <span
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ boxShadow: '0 0 20px rgba(108, 92, 231, 0.25), inset 0 0 8px rgba(108, 92, 231, 0.06)' }}
      />
      {/* Gradient border on hover */}
      <span
        className="absolute inset-0 rounded-xl p-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 overflow-hidden"
      >
        <span
          className="block w-full h-full rounded-[11px]"
          style={{ background: 'rgba(15, 15, 20, 0.75)' }}
        />
      </span>

      {/* Arrow icon */}
      <svg
        className="relative w-[18px] h-[18px] text-text-secondary group-hover:text-brand transition-all duration-300 group-hover:-translate-y-0.5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m18 15-6-6-6 6" />
      </svg>
    </button>
  );
};
