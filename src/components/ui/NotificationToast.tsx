import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, AlertTriangle, Sparkles, Info, X, Check, ArrowUpRight } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import { useLang } from '../../hooks/useLang';

interface NotificationToastProps {
  onNavigate?: (page: string) => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ onNavigate }) => {
  const { activeToast, dismissToast, notificationsEnabled } = useNotifications();
  const { lang } = useLang();

  if (!notificationsEnabled || !activeToast) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -25, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -25, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        className="fixed top-20 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 pointer-events-auto"
      >
        <div className="p-4 rounded-2xl bg-[var(--bg-surface)] border-2 border-[var(--accent)] shadow-2xl backdrop-blur-xl flex items-start gap-3 relative overflow-hidden">
          {/* Animated Glow Border */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-[var(--accent)]" />

          <div className="p-2.5 rounded-xl bg-[var(--accent)]/15 text-[var(--accent)] shrink-0 mt-0.5">
            {activeToast.type === 'urgent' ? (
              <AlertTriangle className="w-5 h-5 text-red-500 animate-bounce" />
            ) : activeToast.type === 'briefing' ? (
              <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
            ) : (
              <Bell className="w-5 h-5 text-[var(--accent)]" />
            )}
          </div>

          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-xs font-black text-[var(--text-primary)] truncate">
                {lang === 'ar' ? activeToast.titleAr : activeToast.titleEn}
              </h4>
              <span className="text-[10px] font-mono font-bold text-[var(--text-muted)] shrink-0">
                {lang === 'ar' ? activeToast.timeAr : activeToast.timeEn}
              </span>
            </div>

            <p className="text-[11px] text-[var(--text-secondary)] font-medium line-clamp-2 leading-relaxed">
              {lang === 'ar' ? activeToast.descAr : activeToast.descEn}
            </p>

            <div className="flex items-center gap-3 pt-1">
              {onNavigate && (
                <button
                  onClick={() => {
                    dismissToast();
                    onNavigate('notifications');
                  }}
                  className="text-[11px] font-bold text-[var(--accent)] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>{lang === 'ar' ? 'عرض التنبيهات' : 'View All'}</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          <button
            onClick={dismissToast}
            className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all cursor-pointer shrink-0"
            title={lang === 'ar' ? 'إغلاق' : 'Dismiss'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
