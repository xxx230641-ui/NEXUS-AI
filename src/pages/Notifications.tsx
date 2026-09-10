import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, BellOff, CheckCheck, AlertCircle, Info, Sparkles, Filter, Trash2, Zap, CheckSquare } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ContextBadge } from '../components/ui/ContextBadge';
import { useLang } from '../hooks/useLang';
import { useNotifications } from '../hooks/useNotifications';

export const NotificationsPage: React.FC = () => {
  const { t } = useTranslation();
  const { lang } = useLang();
  const [filter, setFilter] = useState<'all' | 'unread' | 'urgent'>('all');

  const {
    notifications,
    notificationsEnabled,
    toggleNotificationsEnabled,
    markAllRead,
    removeNotification,
    clearAll,
  } = useNotifications();

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return n.unread;
    if (filter === 'urgent') return n.type === 'urgent';
    return true;
  });

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] flex items-center gap-2.5">
            <Bell className="w-8 h-8 text-[var(--accent)]" />
            {t('notificationsPage.title')}
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            {lang === 'ar'
              ? 'جميع التنبيهات المصفاة والتوقعات السياقية المستنتجة لحالات التطبيق الحية'
              : 'All filtered alerts and inferred contextual predictions for live app status.'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {notifications.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={markAllRead}
              icon={<CheckCheck className="w-4 h-4" />}
            >
              {t('notificationsPage.markAllRead')}
            </Button>
          )}

          {notifications.length > 0 && (
            <Button
              size="sm"
              variant="ghost"
              onClick={clearAll}
              icon={<Trash2 className="w-4 h-4 text-red-400" />}
            >
              {lang === 'ar' ? 'مسح الكل' : 'Clear All'}
            </Button>
          )}
        </div>
      </div>

      {/* Global Notifications Status Banner */}
      {!notificationsEnabled && (
        <Card className="border-2 border-amber-500/40 bg-amber-500/10 p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <BellOff className="w-6 h-6 text-amber-500 shrink-0" />
              <div className="space-y-0.5">
                <h4 className="text-xs font-black text-amber-600 dark:text-amber-400">
                  {lang === 'ar' ? 'الإشعارات متوقفة مؤقتاً في الإعدادات' : 'Notifications Paused in Settings'}
                </h4>
                <p className="text-xs text-[var(--text-secondary)]">
                  {lang === 'ar'
                    ? 'تم إيقاف ظهور التنبيهات المنبثقة. يمكنك إعادة تفعيلها مجدداً في أي وقت.'
                    : 'Real-time alert toasts are currently muted. You can re-enable them anytime.'}
                </p>
              </div>
            </div>

            <Button size="sm" variant="primary" onClick={toggleNotificationsEnabled}>
              {lang === 'ar' ? 'تفعيل الإشعارات الآن' : 'Enable Notifications'}
            </Button>
          </div>
        </Card>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-[var(--border-subtle)] pb-2">
        {(['all', 'unread', 'urgent'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`
              px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer
              ${
                filter === f
                  ? 'bg-[var(--accent)] text-white shadow-sm'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
              }
            `}
          >
            {t(`notificationsPage.${f}`)}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.length > 0 ? (
          filtered.map((item) => (
            <Card
              key={item.id}
              className={`
                relative transition-all duration-200
                ${item.unread ? 'border-s-4 border-s-[var(--accent)] bg-[var(--bg-surface)] shadow-md' : 'opacity-85'}
              `}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {item.type === 'urgent' ? (
                      <AlertCircle className="w-5 h-5 text-[var(--danger)]" />
                    ) : item.type === 'briefing' ? (
                      <Sparkles className="w-5 h-5 text-[var(--warning)]" />
                    ) : item.type === 'context' ? (
                      <Zap className="w-5 h-5 text-cyan-400" />
                    ) : (
                      <Info className="w-5 h-5 text-[var(--info)]" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-extrabold text-[var(--text-primary)]">
                        {lang === 'ar' ? item.titleAr : item.titleEn}
                      </h4>
                      {item.unread && (
                        <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
                      )}
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      {lang === 'ar' ? item.descAr : item.descEn}
                    </p>
                    <div className="flex items-center gap-3 pt-1 text-[11px] text-[var(--text-muted)] font-mono">
                      <span>{lang === 'ar' ? item.timeAr : item.timeEn}</span>
                      {item.context && <ContextBadge context={item.context as any} size="sm" />}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => removeNotification(item.id)}
                  className="p-1.5 text-[var(--text-muted)] hover:text-[var(--danger)] transition-colors cursor-pointer"
                  title={lang === 'ar' ? 'حذف الإشعار' : 'Delete Notification'}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))
        ) : (
          <Card className="text-center py-12 text-[var(--text-muted)] space-y-2">
            <Bell className="w-10 h-10 mx-auto opacity-40" />
            <p className="text-xs font-semibold">
              {lang === 'ar'
                ? 'لا توجد إشعارات تطابق التصفية الحالية.'
                : 'No notifications match the selected filter.'}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};


