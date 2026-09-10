import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, UserCheck, Sparkles, ArrowRight, ArrowLeft, X, ShieldAlert, CheckCircle2, KeyRound } from 'lucide-react';
import { Button } from './Button';
import { useLang } from '../../hooks/useLang';

interface GuestRestrictionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToLogin: () => void;
  actionTitle?: string;
}

export const GuestRestrictionModal: React.FC<GuestRestrictionModalProps> = ({
  isOpen,
  onClose,
  onGoToLogin,
  actionTitle,
}) => {
  const { lang, isRTL } = useLang();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.2 }}
          className="
            relative w-full max-w-lg bg-[var(--bg-surface)] border-2 border-amber-500/40 rounded-3xl
            shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6 text-[var(--text-primary)] dir-rtl
          "
        >
          {/* Top Decorative Amber/Gold Glow */}
          <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600" />

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="
              absolute top-4 left-4 p-2 rounded-xl bg-[var(--bg-hover)] text-[var(--text-muted)]
              hover:text-[var(--text-primary)] hover:bg-[var(--border-subtle)] transition-all cursor-pointer
            "
            aria-label={lang === 'ar' ? 'إغلاق النافذة' : 'Close modal'}
          >
            <X className="w-5 h-5" />
          </button>

          {/* Icon Header */}
          <div className="text-center space-y-3 pt-2">
            <div className="relative inline-flex items-center justify-center">
              <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border-2 border-amber-500/30 flex items-center justify-center text-amber-500 shadow-inner">
                <Lock className="w-10 h-10 animate-pulse" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-lg">
                <ShieldAlert className="w-4 h-4" />
              </div>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-[var(--text-primary)]">
              {lang === 'ar' ? 'يتطلب تسجيل الدخول الكامل' : 'Login Required for Full Access'}
            </h3>

            {actionTitle && (
              <div className="inline-block px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold">
                🔒 {actionTitle}
              </div>
            )}
          </div>

          {/* Explanation Text */}
          <div className="p-4 rounded-2xl bg-[var(--bg-base)] border border-[var(--border-subtle)] space-y-3 text-xs leading-relaxed text-[var(--text-secondary)]">
            <p className="font-semibold text-[var(--text-primary)] text-sm">
              {lang === 'ar'
                ? 'أنت تسجل الدخول حالياً كـ (ضيف) - وضع المعاينة المحدود.'
                : 'You are currently browsing as a Guest.'}
            </p>
            <p>
              {lang === 'ar'
                ? 'للوصول إلى هذه الميزة والاستفادة من جميع إمكانيات الذكاء الاصطناعي وتدوين المقابلات المباشرة والتكامل، يلزمك تسجيل الدخول أو إنشاء حساب مجاني.'
                : 'To unlock this feature and access full AI interview capabilities, live transcriptions, and integrations, please log in or create an account.'}
            </p>
          </div>

          {/* Feature Access Matrix List */}
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                {lang === 'ar' ? 'تصفح الواجهات واستعراض التقارير' : 'Browse Interfaces & Sample Reports'}
              </span>
              <span className="text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded-full">{lang === 'ar' ? 'متاح للضيف ✓' : 'Guest Available ✓'}</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 font-bold">
              <span className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-500 shrink-0" />
                {lang === 'ar' ? 'انضمام الذكاء الاصطناعي والإنصات المباشر للمقابلات' : 'Live AI Interview Joiner & Real Transcription'}
              </span>
              <span className="text-[10px] bg-amber-500/20 px-2 py-0.5 rounded-full">{lang === 'ar' ? 'حساب مسجل 🔒' : 'Registered Only 🔒'}</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 font-bold">
              <span className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-500 shrink-0" />
                {lang === 'ar' ? 'تعديل التكتلات وحفظ التكليفات في حسابك' : 'Custom Context Graphs & Account Storage'}
              </span>
              <span className="text-[10px] bg-amber-500/20 px-2 py-0.5 rounded-full">{lang === 'ar' ? 'حساب مسجل 🔒' : 'Registered Only 🔒'}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-2">
            <Button
              onClick={onGoToLogin}
              size="lg"
              fullWidth
              className="bg-[var(--accent)] text-white shadow-lg shadow-[var(--accent)]/25 hover:opacity-95 cursor-pointer font-black"
              icon={<KeyRound className="w-5 h-5" />}
            >
              {lang === 'ar' ? 'تسجيل الدخول / إنشاء حساب جديد الآن' : 'Sign In / Register New Account Now'}
            </Button>

            <button
              type="button"
              onClick={onClose}
              className="
                w-full py-2.5 rounded-xl text-xs font-extrabold text-[var(--text-muted)]
                hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all cursor-pointer
              "
            >
              {lang === 'ar' ? 'مواصلة التصفح كضيف' : 'Continue Browsing as Guest'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
