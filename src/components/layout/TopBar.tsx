import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Settings, ChevronDown, Check, Users, Briefcase, User, GraduationCap, Heart, Bell, BellOff, FileText, Calendar, ArrowRight } from 'lucide-react';
import { Logo } from '../ui/Logo';
import { LangToggle } from '../ui/LangToggle';
import { ContextBadge, ContextType } from '../ui/ContextBadge';
import { useLang } from '../../hooks/useLang';
import { useNotifications } from '../../hooks/useNotifications';
import { getDualDateString } from '../../utils/dateUtils';

interface TopBarProps {
  onNavigate: (page: string) => void;
  onGoBack?: () => void;
  canGoBack?: boolean;
  currentPage?: string;
  activeContext?: string;
  onContextChange?: (context: string) => void;
  userAvatar?: string;
  userName?: string;
  onOpenDailyReport?: () => void;
  onOpenSmartCall?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  onNavigate,
  onGoBack,
  canGoBack = false,
  currentPage = 'dashboard',
  activeContext = 'professional',
  onContextChange,
  userAvatar,
  userName = 'أحمد',
  onOpenDailyReport,
  onOpenSmartCall,
}) => {
  const { lang } = useLang();
  const { t } = useTranslation();
  const { unreadCount, notificationsEnabled } = useNotifications();
  const [isContextDropdownOpen, setIsContextDropdownOpen] = useState<boolean>(false);

  const contextList: { id: ContextType; labelAr: string; labelEn: string; icon: any }[] = [
    { id: 'family', labelAr: '👨‍👩‍👧‍👦 عائلي', labelEn: '👨‍👩‍👧‍👦 Family', icon: Users },
    { id: 'professional', labelAr: '💼 مهني', labelEn: '💼 Professional', icon: Briefcase },
    { id: 'personal', labelAr: '👤 شخصي', labelEn: '👤 Personal', icon: User },
    { id: 'social', labelAr: '🤝 الاجتماعي', labelEn: '🤝 Social', icon: Heart },
    { id: 'learning', labelAr: '🎓 تعليمي', labelEn: '🎓 Learning', icon: GraduationCap },
  ];

  const handleSelectContext = (ctx: string) => {
    if (onContextChange) {
      onContextChange(ctx);
    }
    setIsContextDropdownOpen(false);
  };

  return (
    <header
      className="
        sticky top-0 z-30 w-full
        bg-[var(--bg-overlay)] backdrop-blur-md
        border-b border-[var(--border-subtle)]
        px-3 py-2.5 sm:px-6
        transition-all duration-300
      "
    >
      <div className="flex items-center justify-between max-w-7xl mx-auto gap-2 sm:gap-4">
        {/* Left Side: Back Icon Button, Logo & Interactive Context Selector Badge */}
        <div className="flex items-center gap-2 sm:gap-3 relative">
          {/* Prominent Back Icon Button when not on dashboard */}
          {(currentPage !== 'dashboard' || canGoBack) && onGoBack && (
            <button
              onClick={onGoBack}
              className="
                flex items-center gap-1.5 px-3 py-1.5 rounded-xl
                bg-[var(--accent)] text-white hover:opacity-90
                border border-white/20 font-black text-xs transition-all duration-200
                cursor-pointer shadow-md active:scale-95 touch-manipulation shrink-0
              "
              title={lang === 'ar' ? 'الرجوع للصفحة السابقة' : 'Go back to previous page'}
            >
              <ArrowRight className="w-4 h-4 rtl:rotate-0 ltr:rotate-180 shrink-0 animate-pulse" />
              <span className="font-extrabold">{lang === 'ar' ? 'رجوع' : 'Back'}</span>
            </button>
          )}

          <div className="lg:hidden cursor-pointer" onClick={() => onNavigate('dashboard')}>
            <Logo size="sm" isArabic={lang === 'ar'} />
          </div>

          {/* Interactive Touch Context Badge & Dropdown Trigger */}
          <div className="relative">
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs text-[var(--text-muted)] font-bold">
                {t('dashboard.activeContext')}:
              </span>
              <button
                onClick={() => setIsContextDropdownOpen(!isContextDropdownOpen)}
                className="flex items-center gap-1.5 p-1 rounded-full hover:bg-[var(--bg-hover)] transition-all cursor-pointer group touch-manipulation"
                title={lang === 'ar' ? 'انقر لتغيير السياق (عائلي، مهني، إلخ)' : 'Tap to change context (Family, Professional, etc)'}
              >
                <ContextBadge context={activeContext} size="sm" active score={94} />
                <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-transform" />
              </button>
            </div>

            {/* Mobile Context Badge Touch Button */}
            <div className="sm:hidden">
              <button
                onClick={() => setIsContextDropdownOpen(!isContextDropdownOpen)}
                className="flex items-center gap-1 cursor-pointer touch-manipulation"
              >
                <ContextBadge context={activeContext} size="sm" active />
                <ChevronDown className="w-3 h-3 text-[var(--text-muted)]" />
              </button>
            </div>

            {/* Touch Context Selection Modal/Dropdown */}
            {isContextDropdownOpen && (
              <div
                className="
                  absolute top-full mt-2 ltr:left-0 rtl:right-0 z-50
                  w-56 p-2 rounded-2xl bg-[var(--bg-surface)] border-2 border-[var(--accent)]
                  shadow-2xl space-y-1 animate-in fade-in slide-in-from-top-2 duration-150
                "
              >
                <div className="px-2 py-1.5 text-[11px] font-black text-[var(--text-muted)] border-b border-[var(--border-subtle)] mb-1 flex items-center justify-between">
                  <span>{lang === 'ar' ? 'اختر السياق النشط' : 'Select Context'}</span>
                  <span className="text-[9px] bg-[var(--accent)]/15 text-[var(--accent)] px-1.5 py-0.5 rounded-full font-bold">
                    {lang === 'ar' ? 'تفاعل لمس' : 'Touch Active'}
                  </span>
                </div>

                {contextList.map((item) => {
                  const isSelected = activeContext === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectContext(item.id)}
                      className={`
                        w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-black
                        transition-all cursor-pointer active:scale-95 touch-manipulation
                        ${
                          isSelected
                            ? 'bg-[var(--accent)] text-white shadow-md'
                            : 'text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
                        }
                      `}
                    >
                      <span>{lang === 'ar' ? item.labelAr : item.labelEn}</span>
                      {isSelected && <Check className="w-4 h-4 text-white shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Quick Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Gregorian & Hijri Live Date Badge */}
          <div
            onClick={() => onNavigate('dashboard')}
            className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] border border-[var(--border-subtle)] text-[11px] font-bold text-[var(--text-secondary)] transition-all cursor-pointer shadow-xs"
            title={lang === 'ar' ? 'التقويم الميلادي والهجري اليوم' : 'Gregorian & Hijri Today'}
          >
            <Calendar className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
            <span>{getDualDateString(lang).gregorian}</span>
            <span className="text-[var(--text-muted)] font-mono">|</span>
            <span className="text-amber-600 dark:text-amber-400 font-mono">{getDualDateString(lang).hijri}</span>
          </div>

          {/* Daily Executive Report Button */}
          {onOpenDailyReport && (
            <button
              onClick={onOpenDailyReport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--accent)]/15 text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white border border-[var(--accent)]/30 transition-all cursor-pointer font-black text-xs shadow-xs"
              title={lang === 'ar' ? 'التقرير اليومي الشامل' : 'Daily Executive Report'}
            >
              <FileText className="w-4 h-4 animate-pulse shrink-0" />
              <span className="hidden md:inline">{lang === 'ar' ? 'التقرير اليومي' : 'Daily Report'}</span>
            </button>
          )}

          <LangToggle />

          {/* Prominent Settings Button */}
          <button
            onClick={() => onNavigate('settings')}
            aria-label="Settings"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] border border-[var(--border-subtle)] hover:border-[var(--accent)] transition-all cursor-pointer font-extrabold text-xs"
            title={t('nav.settings')}
          >
            <Settings className="w-4 h-4 text-[var(--accent)]" />
            <span className="hidden sm:inline">{t('nav.settings')}</span>
          </button>

          {/* Prominent Profile Button */}
          <button
            onClick={() => onNavigate('profile')}
            className="flex items-center gap-2 p-1 pr-2.5 rounded-full hover:bg-[var(--bg-hover)] border border-[var(--border-default)] hover:border-[var(--accent)] transition-all cursor-pointer shrink-0 bg-[var(--bg-surface)] shadow-sm"
            title={userName}
          >
            <img
              src={userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
              alt={userName}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-[var(--accent)]"
            />
            <span className="inline text-xs font-black text-[var(--text-primary)] max-w-[100px] truncate">
              {userName}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};

