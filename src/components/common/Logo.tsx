interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

const sizeMap = {
  sm: { icon: 24, text: 'text-base' },
  md: { icon: 32, text: 'text-xl' },
  lg: { icon: 40, text: 'text-2xl' },
};

export const Logo = ({ size = 'md', showText = true, className = '' }: LogoProps) => {
  const { icon, text } = sizeMap[size];

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* Logo Icon */}
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="MangaPress Logo"
      >
        <defs>
          <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#6C5CE7', stopOpacity: 1 }} />
            <stop offset="50%" style={{ stopColor: '#00CECE', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#6C5CE7', stopOpacity: 1 }} />
          </linearGradient>
          <linearGradient id="penGradLogo" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#ffffff', stopOpacity: 0.95 }} />
            <stop offset="100%" style={{ stopColor: '#ede6ff', stopOpacity: 0.8 }} />
          </linearGradient>
          <filter id="logoGlow">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* Background */}
        <rect x="2" y="2" width="44" height="44" rx="12" fill="#0F0F12" />
        <rect x="2" y="2" width="44" height="44" rx="12" stroke="url(#logoGrad)" strokeWidth="1.5" fill="none" opacity="0.4" />
        {/* Comic panel frame */}
        <g filter="url(#logoGlow)">
          <rect x="10" y="9" width="28" height="24" rx="3" stroke="url(#logoGrad)" strokeWidth="2" fill="none" opacity="0.6" />
          <line x1="24" y1="9" x2="24" y2="33" stroke="url(#logoGrad)" strokeWidth="1.2" opacity="0.3" />
          <line x1="10" y1="21" x2="38" y2="21" stroke="url(#logoGrad)" strokeWidth="1.2" opacity="0.3" />
        </g>
        {/* Pen nib */}
        <g filter="url(#logoGlow)">
          <path d="M28 18 L36 38 L32 38 L30 32 L26 32 L24 38 L20 38 L28 18Z" fill="url(#logoGrad)" opacity="0.9" />
          <path d="M28 22 L31 32 L25 32 Z" fill="url(#penGradLogo)" opacity="0.3" />
        </g>
        {/* Accent dots */}
        <circle cx="16" cy="15" r="1.5" fill="#00CECE" opacity="0.8" />
        <circle cx="33" cy="13" r="1" fill="#6C5CE7" opacity="0.6" />
      </svg>

      {/* Logo Text */}
      {showText && (
        <span className={`${text} font-bold tracking-tight`}>
          <span className="text-text-primary">Manga</span>
          <span className="bg-gradient-to-r from-brand to-secondary bg-clip-text text-transparent">Press</span>
        </span>
      )}
    </div>
  );
};
