import React from 'react';
import { Languages } from 'lucide-react';
import { useLang } from '../../hooks/useLang';

interface LangToggleProps {
  className?: string;
  showLabel?: boolean;
}

export const LangToggle: React.FC<LangToggleProps> = ({ className = '', showLabel = true }) => {
  const { lang, toggleLang } = useLang();

  return (
    <button
      onClick={toggleLang}
      type="button"
      aria-label="Toggle Language"
      className={`
        inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold
        bg-[var(--bg-hover)] text-[var(--text-primary)]
        hover:bg-[var(--border-subtle)] border border-[var(--border-subtle)]
        transition-all duration-200 active:scale-95 cursor-pointer
        ${className}
      `}
    >
      <Languages className="w-4 h-4 text-[var(--accent)] shrink-0" />
      {showLabel && (
        <span className="font-semibold tracking-wide">
          {lang === 'ar' ? 'EN' : 'العربية'}
        </span>
      )}
    </button>
  );
};
