import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      type="button"
      aria-label="Toggle Theme"
      className={`
        relative inline-flex items-center justify-center p-2 rounded-xl
        bg-[var(--bg-hover)] text-[var(--text-primary)]
        hover:bg-[var(--border-subtle)] border border-[var(--border-subtle)]
        transition-all duration-300 active:scale-95 cursor-pointer
        ${className}
      `}
    >
      {theme === 'light' ? (
        <Sun className="w-5 h-5 text-amber-500 transition-transform duration-300 hover:rotate-45" />
      ) : (
        <Moon className="w-5 h-5 text-indigo-400 transition-transform duration-300 hover:-rotate-12" />
      )}
    </button>
  );
};
