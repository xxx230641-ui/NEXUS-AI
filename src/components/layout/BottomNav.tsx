import React from 'react';
import { useTranslation } from 'react-i18next';
import { Home, Network, Bell, User, Settings, ShieldAlert } from 'lucide-react';
import { useLang } from '../../hooks/useLang';
import { useAuth } from '../../hooks/useAuth';

interface BottomNavProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  unreadCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentPage, onNavigate, unreadCount = 3 }) => {
  const { t } = useTranslation();
  const { lang } = useLang();
  const { user } = useAuth();

  const isAdminUser = (user?.email || '').trim().toLowerCase() === 'xxx230641@gmail.com';

  const navItems = [
    { id: 'dashboard', label: t('nav.home'), icon: Home },
    { id: 'graph', label: t('nav.graph'), icon: Network },
    { id: 'notifications', label: t('nav.notifications'), icon: Bell, badge: unreadCount },
    { id: 'profile', label: t('nav.profile'), icon: User },
    { id: 'settings', label: t('nav.settings'), icon: Settings },
    ...(isAdminUser ? [{ id: 'admin', label: lang === 'ar' ? 'التحكم' : 'Admin', icon: ShieldAlert }] : []),
  ];

  return (
    <nav
      className="
        lg:hidden fixed bottom-0 left-0 right-0 z-40
        bg-[var(--bg-overlay)] backdrop-blur-md
        border-t border-[var(--border-subtle)]
        px-3 py-2 pb-safe
        shadow-lg transition-all duration-300 select-none
      "
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`
                relative flex flex-col items-center justify-center py-1.5 px-3 rounded-xl min-w-[64px]
                transition-all duration-200 cursor-pointer active:scale-95
                ${
                  isActive
                    ? 'text-[var(--accent)] font-extrabold'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] font-medium'
                }
              `}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 stroke-[2.5]' : 'stroke-[1.8]'}`} />
                {item.badge && item.badge > 0 ? (
                  <span className="absolute -top-1 -right-1.5 w-4 h-4 bg-[var(--danger)] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                ) : null}
              </div>
              <span className="text-[11px] mt-1 tracking-tight leading-tight truncate">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
