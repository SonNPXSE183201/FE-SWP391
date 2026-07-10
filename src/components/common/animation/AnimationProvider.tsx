import { useEffect, type ReactNode } from 'react';

interface AnimationProviderProps {
  children: ReactNode;
}

const REVEAL_SELECTOR = '[data-reveal]:not(.is-revealed), [data-stagger]:not(.is-revealed)';

/**
 * Global IntersectionObserver for [data-reveal] and [data-stagger] elements.
 * Automatically animates any element using these attributes across the app.
 */
export const AnimationProvider = ({ children }: AnimationProviderProps) => {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      document.querySelectorAll('[data-reveal], [data-stagger]').forEach((el) => {
        el.classList.add('is-revealed');
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    const observeElements = () => {
      document.querySelectorAll(REVEAL_SELECTOR).forEach((el) => observer.observe(el));
    };

    observeElements();

    const mutationObserver = new MutationObserver(() => {
      observeElements();
    });

    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  return children;
};
