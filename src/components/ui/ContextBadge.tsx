import React from 'react';
import { useTranslation } from 'react-i18next';

export type ContextType = 'professional' | 'family' | 'learning' | 'social' | 'personal';

interface ContextBadgeProps {
  context: ContextType | string;
  size?: 'sm' | 'md' | 'lg';
  active?: boolean;
  score?: number;
  className?: string;
  onClick?: (e?: React.MouseEvent) => void;
}

const contextColors: Record<string, { bg: string; text: string; border: string }> = {
  professional: { bg: 'rgba(99, 102, 241, 0.12)', text: '#6366F1', border: 'rgba(99, 102, 241, 0.3)' },
  family: { bg: 'rgba(236, 72, 153, 0.12)', text: '#EC4899', border: 'rgba(236, 72, 153, 0.3)' },
  learning: { bg: 'rgba(245, 158, 11, 0.12)', text: '#F59E0B', border: 'rgba(245, 158, 11, 0.3)' },
  social: { bg: 'rgba(16, 185, 129, 0.12)', text: '#10B981', border: 'rgba(16, 185, 129, 0.3)' },
  personal: { bg: 'rgba(14, 165, 233, 0.12)', text: '#0EA5E9', border: 'rgba(14, 165, 233, 0.3)' },
};

export const ContextBadge: React.FC<ContextBadgeProps> = ({
  context,
  size = 'md',
  active = false,
  score,
  className = '',
  onClick,
}) => {
  const { t } = useTranslation();
  const normalizedKey = context.toLowerCase();
  const config = contextColors[normalizedKey] || contextColors.professional;
  const label = t(`contexts.${normalizedKey}`, { defaultValue: context });

  const sizeStyles = {
    sm: 'px-2.5 py-1 text-xs font-bold gap-1.5 rounded-full',
    md: 'px-3.5 py-1.5 text-xs font-extrabold gap-1.5 rounded-full',
    lg: 'px-4 py-2 text-sm font-black gap-2 rounded-full',
  };

  const Component = onClick ? 'button' : 'span';

  return (
    <Component
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      style={{
        backgroundColor: config.bg,
        color: config.text,
        borderColor: config.border,
      }}
      className={`
        inline-flex items-center border transition-all duration-200 select-none whitespace-nowrap
        ${sizeStyles[size]}
        ${active ? 'ring-2 ring-offset-1 ring-[var(--accent)] shadow-sm font-black scale-105' : 'opacity-85 hover:opacity-100'}
        ${onClick ? 'cursor-pointer hover:scale-105 active:scale-95 touch-manipulation' : ''}
        ${className}
      `}
    >
      <span
        className={`w-2 h-2 rounded-full shrink-0 ${active ? 'animate-pulse' : ''}`}
        style={{ backgroundColor: config.text }}
      />
      <span>{label}</span>
      {score !== undefined && (
        <span className="opacity-85 font-mono text-[0.85em] bg-black/10 dark:bg-white/10 px-1.5 py-0.5 rounded-md">
          {score}%
        </span>
      )}
    </Component>
  );
};
