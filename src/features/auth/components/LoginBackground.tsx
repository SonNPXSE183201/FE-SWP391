import React from 'react';

export const LoginBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-[#0F0F14]">
      {/* Animated gradient orbs - layered for depth */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-brand/20 blur-[120px] animate-float" />
      <div
        className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-brand-hover/10 blur-[150px] animate-float"
        style={{ animationDelay: '3s', animationDuration: '25s' }}
      />
      <div
        className="absolute top-[40%] left-[60%] w-[30%] h-[30%] rounded-full bg-blue-500/10 blur-[100px] animate-float"
        style={{ animationDelay: '6s', animationDuration: '22s' }}
      />
      <div
        className="absolute top-[60%] left-[20%] w-[20%] h-[20%] rounded-full bg-purple-400/8 blur-[80px] animate-float"
        style={{ animationDelay: '9s', animationDuration: '28s' }}
      />

      {/* Animated grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(108,92,231,0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(108,92,231,0.15) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Floating manga panel borders - decorative */}
      <div
        className="absolute top-[15%] left-[8%] w-[180px] h-[260px] border-2 border-white/[0.04] rotate-[-12deg] rounded-lg animate-float-card"
        style={{ animationDelay: '1s' }}
      />
      <div
        className="absolute bottom-[15%] right-[12%] w-[280px] h-[180px] border-2 border-white/[0.04] rotate-[8deg] rounded-lg animate-float-card"
        style={{ animationDelay: '3s' }}
      />
      <div
        className="absolute top-[55%] left-[45%] w-[120px] h-[180px] border border-white/[0.03] rotate-[-6deg] rounded-lg animate-float-card"
        style={{ animationDelay: '5s' }}
      />

      {/* Drifting ink particles */}
      {[...Array(6)].map((_, i) => (
        <div
          key={`particle-${i}`}
          className="absolute w-1 h-1 rounded-full bg-brand/40 animate-drift-up"
          style={{
            left: `${15 + i * 14}%`,
            animationDelay: `${i * 3.5}s`,
            animationDuration: `${18 + i * 4}s`,
          }}
        />
      ))}

      {/* Orbiting glow dots */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0 h-0">
        <div
          className="absolute w-2 h-2 rounded-full bg-brand/30 blur-[2px] animate-orbit"
          style={{ animationDuration: '30s' }}
        />
        <div
          className="absolute w-1.5 h-1.5 rounded-full bg-secondary/20 blur-[2px] animate-orbit"
          style={{ animationDuration: '22s', animationDirection: 'reverse' }}
        />
      </div>

      {/* Subtle horizontal glow lines */}
      <div className="absolute top-[30%] left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand/10 to-transparent animate-glow-line" />
      <div
        className="absolute top-[70%] left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand/5 to-transparent animate-glow-line"
        style={{ animationDelay: '1.5s' }}
      />
    </div>
  );
};
