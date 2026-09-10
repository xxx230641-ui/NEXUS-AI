import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
  isArabic?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
  isArabic = true,
}) => {
  const sizePixels = size === 'sm' ? 28 : size === 'lg' ? 48 : 36;
  const textSizeClass = size === 'sm' ? 'text-lg font-bold' : size === 'lg' ? 'text-2xl font-black' : 'text-xl font-extrabold';

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      <div className="relative flex items-center justify-center text-[var(--accent)] shrink-0">
        <svg
          width={sizePixels}
          height={sizePixels}
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-transform duration-300 hover:scale-105"
        >
          {/* Outer orbital node paths */}
          <path
            d="M 8 20 C 8 8, 32 8, 32 20 C 32 32, 8 32, 8 20"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="opacity-90"
          />
          <path
            d="M 20 8 C 32 8, 32 32, 20 32 C 8 32, 8 8, 20 8"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="opacity-60"
          />
          {/* Connected Central Node */}
          <circle cx="20" cy="20" r="4.5" fill="currentColor" />
          <circle cx="8" cy="20" r="2.5" fill="currentColor" />
          <circle cx="32" cy="20" r="2.5" fill="currentColor" />
          <circle cx="20" cy="8" r="2.5" fill="currentColor" />
          <circle cx="20" cy="32" r="2.5" fill="currentColor" />
        </svg>
      </div>

      {showText && (
        <span
          className={`tracking-tight text-[var(--text-primary)] transition-colors ${textSizeClass}`}
          style={{ fontFamily: isArabic ? "'Cairo', sans-serif" : "'Inter', sans-serif" }}
        >
          {isArabic ? 'نكسوس' : 'NEXUS'}
        </span>
      )}
    </div>
  );
};
