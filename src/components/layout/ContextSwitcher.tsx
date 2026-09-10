import React from 'react';
import { ContextCategory } from '../../types';
import { Briefcase, Heart, GraduationCap, Users, User, Sparkles } from 'lucide-react';

interface ContextSwitcherProps {
  activeContext: ContextCategory;
  onSelectContext: (category: ContextCategory) => void;
  isAutoClassified?: boolean;
  isRtl?: boolean;
}

export const ContextSwitcher: React.FC<ContextSwitcherProps> = ({
  activeContext,
  onSelectContext,
  isAutoClassified = true,
  isRtl = false,
}) => {
  const contexts: {
    id: ContextCategory;
    nameEn: string;
    nameAr: string;
    score: number;
    color: string;
    icon: React.ReactNode;
  }[] = [
    { id: 'Professional', nameEn: 'Professional', nameAr: 'مهني', score: 96, color: '#6366F1', icon: <Briefcase className="w-3.5 h-3.5" /> },
    { id: 'Family', nameEn: 'Family', nameAr: 'عائلي', score: 92, color: '#F43F5E', icon: <Heart className="w-3.5 h-3.5" /> },
    { id: 'Learning', nameEn: 'Learning', nameAr: 'تعليمي', score: 88, color: '#F59E0B', icon: <GraduationCap className="w-3.5 h-3.5" /> },
    { id: 'Social', nameEn: 'Social', nameAr: 'اجتماعي', score: 85, color: '#10B981', icon: <Users className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto py-1 no-scrollbar shrink-0">
      {/* Auto Detect Indicator */}
      {isAutoClassified && (
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-semibold shrink-0">
          <Sparkles className="w-3 h-3 text-violet-400" />
          <span>{isRtl ? 'تلقائي' : 'AI'}</span>
        </div>
      )}

      {/* Context Pills */}
      <div className="flex items-center gap-1.5 bg-[#0C0C0F] p-1 rounded-full border border-white/10 shrink-0">
        {contexts.map((ctx) => {
          const isActive = activeContext === ctx.id;
          return (
            <button
              key={ctx.id}
              onClick={() => onSelectContext(ctx.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 select-none ${
                isActive
                  ? 'text-white shadow-lg font-bold scale-[1.02]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
              style={{
                backgroundColor: isActive ? ctx.color : 'transparent',
                boxShadow: isActive ? `0 0 16px ${ctx.color}60` : undefined,
              }}
            >
              <span className={isActive ? 'text-white' : 'text-slate-400'}>{ctx.icon}</span>
              <span>{isRtl ? ctx.nameAr : ctx.nameEn}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
