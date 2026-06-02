import React from 'react';

export const LoginBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-[#0F0F14]">
      {/* Animated gradient orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-brand/20 blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-brand-hover/10 blur-[150px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] rounded-full bg-blue-500/10 blur-[100px] animate-pulse" style={{ animationDelay: '4s' }}></div>

      {/* Decorative Manga Panels */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)`,
        backgroundSize: '40px 40px'
      }}></div>

      {/* Abstract ink splashes or panel borders could be added here */}
      <div className="absolute top-[20%] left-[10%] w-[200px] h-[300px] border-2 border-white/5 rotate-[-15deg] rounded-lg"></div>
      <div className="absolute bottom-[20%] right-[15%] w-[300px] h-[200px] border-2 border-white/5 rotate-[10deg] rounded-lg"></div>
    </div>
  );
};
