import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
  accentBorder?: string; // Optional context color highlight
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  onClick,
  hoverable = false,
  accentBorder,
}) => {
  return (
    <div
      onClick={onClick}
      style={{
        borderTopColor: accentBorder || undefined,
        borderTopWidth: accentBorder ? '3px' : undefined,
      }}
      className={`
        bg-[var(--bg-surface)]
        border border-[var(--border-subtle)]
        rounded-2xl p-5 sm:p-6
        text-[var(--text-primary)]
        shadow-sm
        transition-all duration-200
        ${hoverable ? 'hover:shadow-md hover:border-[var(--border-default)] cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};
