import { useEffect, useRef, useState } from 'react';

export const MangaShowcaseSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);

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

  const showcaseItems = [
    {
      image: '/images/landing/manga-action.png',
      title: 'Action — Shōnen',
      subtitle: 'Cảnh chiến đấu mãnh liệt',
      span: 'col-span-2 row-span-2',
    },
    {
      image: '/images/landing/manga-emotional.png',
      title: 'Romance — Shōjo',
      subtitle: 'Khoảnh khắc lãng mạn',
      span: 'col-span-2 row-span-1',
    },
    {
      image: '/images/landing/manga-fantasy.png',
      title: 'Fantasy — Seinen',
      subtitle: 'Thế giới tưởng tượng hoành tráng',
      span: 'col-span-2 row-span-1',
    },
    {
      image: '/images/landing/manga-panels.png',
      title: 'Panel Layout',
      subtitle: 'Bố cục trang chuyên nghiệp',
      span: 'col-span-2 row-span-1',
    },
    {
      image: '/images/landing/manga-characters.png',
      title: 'Character Design',
      subtitle: 'Đa dạng phong cách nhân vật',
      span: 'col-span-2 row-span-1',
    },
  ];

  // Horizontal scrolling artwork strip
  const artworkStrip = [
    '/images/landing/manga-action.png',
    '/images/landing/manga-fantasy.png',
    '/images/landing/manga-emotional.png',
    '/images/landing/manga-panels.png',
    '/images/landing/manga-characters.png',
    '/images/landing/manga-sketching.png',
    '/images/landing/published-volumes.png',
    '/images/landing/collaboration.png',
  ];

  return (
    <section
      ref={sectionRef}
      id="showcase-section"
      className="py-24 bg-bg-primary relative overflow-hidden"
    >
      {/* Background accents */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand/5 rounded-full blur-[200px] pointer-events-none" />

      <div className="max-w-[1280px] mx-auto px-8 relative z-10">
        {/* Section Header */}
        <div className={`text-center max-w-2xl mx-auto mb-16 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-secondary/10 border border-secondary/25 rounded-full mb-6">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-secondary">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21,15 16,10 5,21"/>
            </svg>
            <span className="text-[13px] font-medium text-secondary tracking-wide">Showcase</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
            Thế giới manga{' '}
            <span className="bg-gradient-to-r from-secondary to-brand bg-clip-text text-transparent">
              sống động
            </span>
          </h2>
          <p className="text-text-secondary text-lg">
            Từ ý tưởng phác thảo đến tác phẩm hoàn chỉnh — khám phá quy trình sáng tạo manga chuyên nghiệp trên nền tảng của chúng tôi.
          </p>
        </div>

        {/* Masonry-style Gallery Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5 auto-rows-[160px] md:auto-rows-[200px] mb-16">
          {showcaseItems.map((item, index) => {
            const isRevealed = isVisible;
            const isHovered = hoveredItem === index;
            const isOtherHovered = hoveredItem !== null && hoveredItem !== index;

            return (
              <div
                key={item.title}
                className={`${item.span} group relative rounded-2xl overflow-hidden border border-border-custom/40 cursor-pointer transition-all duration-700 ease-out ${
                  isRevealed
                    ? 'opacity-100 scale-100'
                    : 'opacity-0 scale-[0.85]'
                } ${isOtherHovered ? 'opacity-70 scale-[0.98]' : ''}`}
                style={{ transitionDelay: `${index * 120}ms` }}
                onMouseEnter={() => setHoveredItem(index)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                {/* Image */}
                <img
                  src={item.image}
                  alt={item.title}
                  className={`w-full h-full object-cover transition-transform duration-700 ${isHovered ? 'scale-110' : 'scale-100'}`}
                  loading="lazy"
                />

                {/* Gradient Overlay — dynamic on hover */}
                <div className={`absolute inset-0 transition-all duration-500 ${
                  isHovered 
                    ? 'bg-gradient-to-t from-bg-primary/95 via-bg-primary/40 to-transparent' 
                    : 'bg-gradient-to-t from-bg-primary/90 via-bg-primary/20 to-transparent opacity-60'
                }`} />

                {/* Glow border on hover */}
                <div className={`absolute inset-0 rounded-2xl border-2 transition-all duration-500 ${
                  isHovered ? 'border-brand/50 shadow-[inset_0_0_30px_rgba(108,92,231,0.1)]' : 'border-transparent'
                }`} />

                {/* Content overlay — slide up on hover */}
                <div className={`absolute bottom-0 left-0 right-0 p-4 md:p-5 transition-all duration-500 ${
                  isHovered ? 'translate-y-0' : 'translate-y-2'
                }`}>
                  <h3 className="text-base md:text-lg font-semibold text-text-primary mb-0.5">{item.title}</h3>
                  <p className={`text-xs md:text-sm text-text-secondary transition-all duration-500 delay-75 ${
                    isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                  }`}>{item.subtitle}</p>
                </div>

                {/* Corner glow */}
                <div className={`absolute -top-10 -right-10 w-20 h-20 bg-brand/30 rounded-full blur-2xl transition-opacity duration-500 ${
                  isHovered ? 'opacity-100' : 'opacity-0'
                }`} />
                <div className={`absolute -bottom-8 -left-8 w-16 h-16 bg-secondary/20 rounded-full blur-xl transition-opacity duration-500 ${
                  isHovered ? 'opacity-100' : 'opacity-0'
                }`} />
              </div>
            );
          })}
        </div>

        {/* Infinite Scrolling Artwork Strips — dual direction */}
        <div className="space-y-4">
          {/* Strip 1 — scroll left */}
          <div className="relative overflow-hidden rounded-xl">
            <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-bg-primary to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-bg-primary to-transparent z-10 pointer-events-none" />
            <div className="flex gap-4 animate-scroll-x hover:[animation-play-state:paused]">
              {[...artworkStrip, ...artworkStrip].map((src, i) => (
                <div
                  key={`strip-a-${i}`}
                  className="shrink-0 w-[200px] h-[120px] md:w-[260px] md:h-[150px] rounded-xl overflow-hidden border border-border-custom/30 shadow-md-custom hover:border-brand/40 transition-all duration-300 hover:scale-105 hover:shadow-[0_8px_30px_rgba(108,92,231,0.2)]"
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
          </div>

          {/* Strip 2 — scroll right (counter direction) */}
          <div className="relative overflow-hidden rounded-xl">
            <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-bg-primary to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-bg-primary to-transparent z-10 pointer-events-none" />
            <div className="flex gap-4 animate-counter-scroll hover:[animation-play-state:paused]">
              {[...artworkStrip.slice().reverse(), ...artworkStrip.slice().reverse()].map((src, i) => (
                <div
                  key={`strip-b-${i}`}
                  className="shrink-0 w-[200px] h-[100px] md:w-[220px] md:h-[120px] rounded-xl overflow-hidden border border-border-custom/30 shadow-md-custom hover:border-secondary/40 transition-all duration-300 hover:scale-105 hover:shadow-[0_8px_30px_rgba(0,206,206,0.2)]"
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
          </div>
        </div>
      </div>
    </section>
  );
};
