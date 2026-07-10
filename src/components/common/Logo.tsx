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
        aria-label="Inku Logo"
      >
        <defs>
          <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#6C5CE7', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#00CECE', stopOpacity: 1 }} />
          </linearGradient>
          <linearGradient id="logoInkDrop" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#8B7CF0', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#6C5CE7', stopOpacity: 1 }} />
          </linearGradient>
          <linearGradient id="logoNibGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#00CECE', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#00A5A5', stopOpacity: 1 }} />
          </linearGradient>
        </defs>
        {/* Background */}
        <rect x="1" y="1" width="46" height="46" rx="14" fill="#0F0F12" />
        <rect x="1" y="1" width="46" height="46" rx="14" stroke="url(#logoGrad)" strokeWidth="1.5" fill="none" opacity="0.35" />
        {/* Ink drop */}
        <path d="M24 8 C24 8, 14 20, 14 27 C14 32.5 18.5 37 24 37 C29.5 37 34 32.5 34 27 C34 20 24 8 24 8Z" fill="url(#logoInkDrop)" opacity="0.9" />
        <ellipse cx="20" cy="24" rx="3.5" ry="5" fill="white" opacity="0.1" transform="rotate(-15 20 24)" />
        {/* Pen nib */}
        <path d="M24 6 L27 14 L24 12.5 L21 14 Z" fill="url(#logoNibGrad)" opacity="0.95" />
        {/* Panel lines */}
        <line x1="18" y1="26" x2="30" y2="26" stroke="white" strokeWidth="0.6" opacity="0.15" />
        <line x1="24" y1="22" x2="24" y2="33" stroke="white" strokeWidth="0.6" opacity="0.12" />
        {/* Sparkles */}
        <circle cx="31" cy="15" r="1.2" fill="#00CECE" opacity="0.7" />
        <circle cx="15" cy="18" r="0.8" fill="#6C5CE7" opacity="0.5" />
      </svg>

      {/* Logo Text */}
      {showText && (
        <span className={`${text} font-bold tracking-tight`}>
          <span className="text-text-primary">Ink</span>
          <span className="bg-gradient-to-r from-brand to-secondary bg-clip-text text-transparent">u</span>
        </span>
      )}
    </div>
  );
};
