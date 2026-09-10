import React from 'react';
import { useTranslation } from 'react-i18next';
import { Home, Network, Bell, User, Settings, HelpCircle, BrainCircuit, Sparkles, ChevronLeft, ChevronRight, ShieldAlert } from 'lucide-react';
import { Logo } from '../ui/Logo';
import { ThemeToggle } from '../ui/ThemeToggle';
import { LangToggle } from '../ui/LangToggle';
import { useLang } from '../../hooks/useLang';
import { useNotifications } from '../../hooks/useNotifications';
import { useAuth } from '../../hooks/useAuth';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onOpenAIModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate, onOpenAIModal }) => {
  const { t } = useTranslation();
  const { lang, isRTL } = useLang();
  const { unreadCount, notificationsEnabled } = useNotifications();
  const { user } = useAuth();

  const isAdminUser = (user?.email || '').trim().toLowerCase() === 'xxx230641@gmail.com';

  const navSections = [
    {
      titleAr: 'الرئيسية والسياقات',
      titleEn: 'Core & Contexts',
      items: [
        { id: 'dashboard', label: t('nav.home'), icon: Home },
        { id: 'graph', label: t('nav.graph'), icon: Network },
      ],
    },
    {
      titleAr: 'التنشيط والإشعارات',
      titleEn: 'Activities & Alerts',
      items: [
        { id: 'notifications', label: t('nav.notifications'), icon: Bell, badge: unreadCount },
      ],
    },
    {
      titleAr: 'الحساب والتكاملات',
      titleEn: 'Account & Integrations',
      items: [
        { id: 'profile', label: t('nav.profile'), icon: User },
        { id: 'settings', label: t('nav.settings'), icon: Settings },
        ...(isAdminUser
          ? [{ id: 'admin', label: lang === 'ar' ? 'لوحة التحكم (Admin)' : 'Admin Control', icon: ShieldAlert, badgeText: 'Pro' }]
          : []),
      ],
    },
    {
      titleAr: 'المساعدة والدعم',
      titleEn: 'Support & Docs',
      items: [
        { id: 'help', label: t('nav.help'), icon: HelpCircle },
      ],
    },
  ];

  return (
    <aside
      className={`
        hidden lg:flex flex-col w-64 shrink-0 h-screen sticky top-0
        bg-[var(--bg-surface)] border-b lg:border-b-0
        ${isRTL ? 'border-l border-[var(--border-subtle)]' : 'border-r border-[var(--border-subtle)]'}
        px-4 py-6 z-30 transition-all duration-300 select-none
      `}
    >
      {/* Brand Header */}
      <div className="px-3 mb-6 cursor-pointer" onClick={() => onNavigate('dashboard')}>
        <Logo size="md" isArabic={lang === 'ar'} />
      </div>

      {/* Dedicated Executive AI Assistant Sidebar Card */}
      {onOpenAIModal && (
        <div className="mb-6 px-1">
          <button
            onClick={onOpenAIModal}
            className="
              w-full p-3.5 rounded-2xl text-start transition-all cursor-pointer group
              bg-indigo-600 hover:bg-indigo-700
              text-white shadow-lg hover:shadow-cyan-500/25 border-2 border-white/20
              hover:scale-[1.02] active:scale-[0.98]
            "
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-white/20 backdrop-blur-md">
                  <BrainCircuit className="w-5 h-5 text-amber-300 animate-pulse" />
                </div>
                <span className="text-xs font-black tracking-wide">
                  {lang === 'ar' ? 'المساعد الذكي (NEXUS)' : 'NEXUS AI Twin'}
                </span>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <p className="text-[11px] text-cyan-100/90 font-medium leading-snug">
              {lang === 'ar'
                ? 'تحكم كامل بالتطبيق بالأوامر الصوتية والنصية'
                : 'Full app authority via voice & text'}
            </p>
            <div className="mt-2 text-[10px] font-black text-amber-300 flex items-center justify-between pt-1.5 border-t border-white/15">
              <span>{lang === 'ar' ? 'تحدث معي الآن ⚡' : 'Talk with AI ⚡'}</span>
              {isRTL ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </div>
          </button>
        </div>
      )}

      {/* Primary Categorized Navigation Links */}
      <nav className="flex-1 space-y-4 overflow-y-auto pr-1 custom-scrollbar">
        {navSections.map((sec, idx) => (
          <div key={idx} className="space-y-1">
            <div className="px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)] opacity-80">
              {lang === 'ar' ? sec.titleAr : sec.titleEn}
            </div>
            {sec.items.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`
                    w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold
                    transition-all duration-200 cursor-pointer
                    ${
                      isActive
                        ? 'bg-[var(--accent)] text-white shadow-sm font-black'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
                    }
                  `}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-[var(--text-muted)]'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badgeText ? (
                    <span className={`px-2 py-0.5 text-[9px] font-black rounded-md ${isActive ? 'bg-white text-[var(--accent)]' : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'}`}>
                      {item.badgeText}
                    </span>
                  ) : item.badge && notificationsEnabled && item.badge > 0 ? (
                    <span className={`px-2 py-0.5 text-[10px] font-black rounded-full ${isActive ? 'bg-white text-[var(--accent)]' : 'bg-[var(--danger)] text-white'}`}>
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer Controls: Theme & Language Switchers */}
      <div className="pt-4 mt-auto border-t border-[var(--border-subtle)] space-y-3">
        <div className="flex items-center justify-between px-2 gap-2">
          <ThemeToggle />
          <LangToggle />
        </div>
      </div>
    </aside>
  );
};

