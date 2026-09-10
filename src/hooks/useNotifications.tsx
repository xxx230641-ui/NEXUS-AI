import React, { createContext, useContext, useState, useEffect } from 'react';

export interface AppNotification {
  id: string;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  timeAr: string;
  timeEn: string;
  unread: boolean;
  type: 'urgent' | 'briefing' | 'info' | 'context';
  category: 'contextShifts' | 'conflicts' | 'aiBriefings' | 'tasks';
  context: string;
}

export interface NotificationCategories {
  contextShifts: boolean;
  conflicts: boolean;
  aiBriefings: boolean;
  tasks: boolean;
}

interface NotificationContextType {
  notificationsEnabled: boolean;
  setNotificationsEnabled: (enabled: boolean) => void;
  toggleNotificationsEnabled: () => void;
  categories: NotificationCategories;
  setCategorySetting: (cat: keyof NotificationCategories, value: boolean) => void;
  notifications: AppNotification[];
  unreadCount: number;
  activeToast: AppNotification | null;
  dismissToast: () => void;
  addNotification: (notif: Omit<AppNotification, 'id' | 'timeAr' | 'timeEn' | 'unread'>) => void;
  markAllRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  simulateNotification: (customType?: 'context' | 'conflict' | 'briefing' | 'task') => void;
  nativePermission: 'granted' | 'denied' | 'default' | 'unsupported';
  requestNativePermission: () => Promise<boolean>;
}

const DEFAULT_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'n1',
    titleAr: 'تضارب مواعيد محتمل بين الموعد العائلي وتسليم المشروع',
    titleEn: 'Potential Schedule Conflict: Family Dinner & Project Delivery',
    descAr: 'اجتماع التسليم النهائي في تمام الساعة ٥:٤٥ م يتقاطع مع الموعد العائلي المستهدف عند ٦:٠٠ م.',
    descEn: 'Final sprint review meeting at 5:45 PM overlaps with family dinner target at 6:00 PM.',
    timeAr: 'منذ ١٥ دقيقة',
    timeEn: '15 mins ago',
    unread: true,
    type: 'urgent',
    category: 'conflicts',
    context: 'professional',
  },
  {
    id: 'n2',
    titleAr: 'الملخص اليومي الذكي جاهز',
    titleEn: 'Smart Daily Briefing Ready',
    descAr: 'تم بناء الخطة التنبؤية لليوم مع توصية التركيز في الفترة الصباحية.',
    descEn: 'Predictive daily plan prepared with morning focus recommendations.',
    timeAr: 'منذ ساعة',
    timeEn: '1 hour ago',
    unread: true,
    type: 'briefing',
    category: 'aiBriefings',
    context: 'personal',
  },
  {
    id: 'n3',
    titleAr: 'نجاح مزامنة Google Workspace',
    titleEn: 'Google Workspace Sync Successful',
    descAr: 'تم تحديث الأحداث والمواعيد الجارية من التقويم الرئيسي بنجاح.',
    descEn: 'Events and upcoming schedule updated from master calendar successfully.',
    timeAr: 'منذ ٣ ساعات',
    timeEn: '3 hours ago',
    unread: false,
    type: 'info',
    category: 'contextShifts',
    context: 'professional',
  },
];

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notificationsEnabled, setNotificationsEnabledState] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nexus_notifs_enabled');
      return saved !== null ? JSON.parse(saved) : true;
    }
    return true;
  });

  const [categories, setCategoriesState] = useState<NotificationCategories>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nexus_notif_categories');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          /* fallback */
        }
      }
    }
    return {
      contextShifts: true,
      conflicts: true,
      aiBriefings: true,
      tasks: true,
    };
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nexus_notifs_list');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          /* fallback */
        }
      }
    }
    return DEFAULT_NOTIFICATIONS;
  });

  const [activeToast, setActiveToast] = useState<AppNotification | null>(null);

  const [nativePermission, setNativePermission] = useState<'granted' | 'denied' | 'default' | 'unsupported'>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission as 'granted' | 'denied' | 'default';
    }
    return 'unsupported';
  });

  const requestNativePermission = async (): Promise<boolean> => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const res = await Notification.requestPermission();
        setNativePermission(res as 'granted' | 'denied' | 'default');
        return res === 'granted';
      } catch (err) {
        console.error('Permission request failed:', err);
      }
    }
    return false;
  };

  // Sync state to LocalStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('nexus_notifs_enabled', JSON.stringify(notificationsEnabled));
    }
  }, [notificationsEnabled]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('nexus_notif_categories', JSON.stringify(categories));
    }
  }, [categories]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('nexus_notifs_list', JSON.stringify(notifications));
    }
  }, [notifications]);

  // Real-Time Global Broadcast Notifications Listener
  useEffect(() => {
    if (!notificationsEnabled) return;

    const syncLiveBroadcasts = async () => {
      try {
        const res = await fetch('/api/notifications/broadcasts');
        if (!res.ok) return;
        const data = await res.json();
        
        if (data.success && Array.isArray(data.broadcasts)) {
          const rawSeen = localStorage.getItem('nexus_seen_broadcast_ids');
          let seenIds: string[] = [];
          if (rawSeen) {
            try {
              seenIds = JSON.parse(rawSeen);
            } catch (e) {
              seenIds = [];
            }
          }

          let newFound = false;
          for (const bc of data.broadcasts) {
            if (bc.id && !seenIds.includes(bc.id)) {
              seenIds.push(bc.id);
              newFound = true;

              // Deliver real notification to the user session
              addNotification({
                titleAr: bc.titleAr || bc.textAr || '📢 إعلان عام من الإدارة',
                titleEn: bc.titleEn || bc.textEn || '📢 Global System Broadcast',
                descAr: bc.textAr || bc.titleAr || '',
                descEn: bc.textEn || bc.titleEn || '',
                type: bc.type === 'alert' ? 'urgent' : bc.type === 'warning' ? 'briefing' : 'info',
                category: 'aiBriefings',
                context: 'professional',
              });
            }
          }

          if (newFound) {
            localStorage.setItem('nexus_seen_broadcast_ids', JSON.stringify(seenIds));
          }
        }
      } catch (err) {
        // Silently ignore background poll errors
      }
    };

    // Initial check
    syncLiveBroadcasts();

    // Poll every 5 seconds for instant real delivery
    const intervalId = setInterval(syncLiveBroadcasts, 5000);
    return () => clearInterval(intervalId);
  }, [notificationsEnabled]);

  const setNotificationsEnabled = (enabled: boolean) => {
    setNotificationsEnabledState(enabled);
    if (!enabled) {
      setActiveToast(null);
    }
  };

  const toggleNotificationsEnabled = () => {
    setNotificationsEnabled(!notificationsEnabled);
  };

  const setCategorySetting = (cat: keyof NotificationCategories, value: boolean) => {
    setCategoriesState((prev) => ({ ...prev, [cat]: value }));
  };

  const dismissToast = () => {
    setActiveToast(null);
  };

  const addNotification = (notifData: Omit<AppNotification, 'id' | 'timeAr' | 'timeEn' | 'unread'>) => {
    // Check if master notifications are disabled or category is turned off
    if (!notificationsEnabled) return;
    if (categories[notifData.category] === false) return;

    const newNotif: AppNotification = {
      ...notifData,
      id: 'n_' + Date.now(),
      timeAr: 'الآن',
      timeEn: 'Just now',
      unread: true,
    };

    setNotifications((prev) => [newNotif, ...prev]);

    // Dispatch OS Browser Native System Push Notification
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new window.Notification(notifData.titleAr || notifData.titleEn, {
          body: notifData.descAr || notifData.descEn,
          tag: 'nexus_push_' + Date.now(),
        });
      } catch (err) {
        console.warn('Native notification trigger error:', err);
      }
    }

    setActiveToast(newNotif);

    // Auto-dismiss toast after 5 seconds
    setTimeout(() => {
      setActiveToast((current) => (current?.id === newNotif.id ? null : current));
    }, 5000);
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (activeToast?.id === id) {
      setActiveToast(null);
    }
  };

  const clearAll = () => {
    setNotifications([]);
    setActiveToast(null);
  };

  const simulateNotification = (customType?: 'context' | 'conflict' | 'briefing' | 'task') => {
    const types: ('context' | 'conflict' | 'briefing' | 'task')[] = ['context', 'conflict', 'briefing', 'task'];
    const chosenType = customType || types[Math.floor(Math.random() * types.length)];

    if (chosenType === 'context') {
      addNotification({
        titleAr: 'تحوّل تلقائي للسياق المهني 💼',
        titleEn: 'Automatic Shift to Professional Context 💼',
        descAr: 'تم رصد وصولك إلى مقر العمل، وتم تفعيل تصفية إشعارات Slack والتقويم.',
        descEn: 'Arrived at workspace. Slack and Calendar focus filters activated.',
        type: 'context',
        category: 'contextShifts',
        context: 'professional',
      });
    } else if (chosenType === 'conflict') {
      addNotification({
        titleAr: 'تنبيه: تضارب في التقويم اليومي ⚡',
        titleEn: 'Alert: Schedule Overlap Detected ⚡',
        descAr: 'اجتماع السبرينت يتقاطع مع موعد تسليم المهمة العائلية.',
        descEn: 'Sprint meeting overlaps with family schedule event.',
        type: 'urgent',
        category: 'conflicts',
        context: 'professional',
      });
    } else if (chosenType === 'briefing') {
      addNotification({
        titleAr: 'تحديث التوأم الرقمي J.A.R.V.I.S 🤖',
        titleEn: 'J.A.R.V.I.S Digital Twin Update 🤖',
        descAr: 'تم استنتاج نمط التركيز لليوم وتحديث المخطط البياني المتقدم.',
        descEn: 'Analyzed today\'s focus pattern and updated advanced context graph.',
        type: 'briefing',
        category: 'aiBriefings',
        context: 'personal',
      });
    } else {
      addNotification({
        titleAr: 'إنجاز مهمة ذكية جديدة ✅',
        titleEn: 'Smart Task Completed ✅',
        descAr: 'تم تسجيل إنجاز مهمة مراجعة الخوارزمية بنجاح.',
        descEn: 'Algorithm review task marked complete successfully.',
        type: 'info',
        category: 'tasks',
        context: 'professional',
      });
    }
  };

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <NotificationContext.Provider
      value={{
        notificationsEnabled,
        setNotificationsEnabled,
        toggleNotificationsEnabled,
        categories,
        setCategorySetting,
        notifications,
        unreadCount,
        activeToast,
        dismissToast,
        addNotification,
        markAllRead,
        removeNotification,
        clearAll,
        simulateNotification,
        nativePermission,
        requestNativePermission,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
