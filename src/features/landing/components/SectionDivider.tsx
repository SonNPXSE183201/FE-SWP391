interface SectionDividerProps {
  variant?: 'glow' | 'gradient' | 'dots';
  color?: 'brand' | 'secondary' | 'mixed';
}

/**
 * Animated divider between landing page sections.
 * Creates visual continuity with glowing lines, gradients, or dot patterns.
 */
export const SectionDivider = ({ variant = 'glow', color = 'brand' }: SectionDividerProps) => {
  const colorMap = {
    brand: {
      primary: '#6C5CE7',
      secondary: '#7C6EF0',
      glow: 'rgba(108, 92, 231, 0.6)',
    },
    secondary: {
      primary: '#00CECE',
      secondary: '#00E5E5',
      glow: 'rgba(0, 206, 206, 0.6)',
    },
    mixed: {
      primary: '#6C5CE7',
      secondary: '#00CECE',
      glow: 'rgba(108, 92, 231, 0.4)',
    },
  };

  const colors = colorMap[color];

  if (variant === 'dots') {
    return (
      <div className="relative py-6 flex justify-center items-center gap-2" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{
              backgroundColor: i === 2 ? colors.primary : `${colors.primary}40`,
              animationDelay: `${i * 200}ms`,
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === 'gradient') {
    return (
      <div className="relative h-px" aria-hidden="true">
        <div
          className="absolute inset-0 animate-glow-line"
          style={{
            background: `linear-gradient(90deg, transparent, ${colors.primary}, ${colors.secondary}, ${colors.primary}, transparent)`,
            backgroundSize: '200% 100%',
          }}
        />
        <div
          className="absolute inset-0 blur-md opacity-60"
          style={{
            background: `linear-gradient(90deg, transparent, ${colors.glow}, transparent)`,
          }}
        />
      </div>
    );
  }

  // Default: glow
  return (
    <div className="relative h-px overflow-hidden" aria-hidden="true">
      <div
        className="absolute inset-0 animate-glow-line"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${colors.primary}30 20%, ${colors.primary} 50%, ${colors.secondary}30 80%, transparent 100%)`,
        }}
      />
      <div
        className="absolute -top-4 left-1/2 -translate-x-1/2 w-32 h-8 rounded-full blur-xl opacity-30"
        style={{ backgroundColor: colors.glow }}
      />
    </div>
  );
};
