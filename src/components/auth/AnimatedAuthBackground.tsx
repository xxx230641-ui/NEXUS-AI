import React from 'react';

interface AnimatedAuthBackgroundProps {
  isRTL?: boolean;
}

// Clean, high-resolution static background image (Serene minimalist dark digital artwork)
const STATIC_BG = {
  url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1920&q=80',
  gradient: 'from-slate-950/85 via-slate-950/60 to-slate-950/90',
};

export const AnimatedAuthBackground: React.FC<AnimatedAuthBackgroundProps> = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {/* Crisp Static High-Res Background Image - No Animation or Motion */}
      <div className="absolute inset-0 w-full h-full">
        <img
          src={STATIC_BG.url}
          alt="Static High-Resolution Background"
          className="w-full h-full object-cover filter brightness-90 contrast-105"
        />
      </div>

      {/* Dark Vignette Overlay for High Text Readability & Contrast */}
      <div className={`absolute inset-0 bg-gradient-to-b ${STATIC_BG.gradient} backdrop-blur-[1px]`} />

      {/* Subtle Static Radial Mesh Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:28px_28px] opacity-10" />
    </div>
  );
};


