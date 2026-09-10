import React, { createContext, useContext, useState, useEffect } from 'react';

export interface ConnectedApp {
  id: string;
  name: string;
  nameAr: string;
  category: 'messaging' | 'work' | 'system' | 'health';
  connected: boolean;
  icon: string;
  itemsCount: number;
  lastSync: string;
  requiredForOnboarding?: boolean;
}

export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  role: string;
  authMethod: 'google' | 'microsoft' | 'apple' | 'github' | 'manual' | 'guest' | string;
  activeContextsCount: number;
  connectedAppsCount: number;
  weeklyNotificationsCount: number;
  avgFocusIndex: number;
  isGuest?: boolean;
}

interface AuthContextType {
  user: UserProfile;
  setUser: React.Dispatch<React.SetStateAction<UserProfile>>;
  isGuest: boolean;
  loginUser: (email: string, name?: string, method?: 'google' | 'microsoft' | 'apple' | 'github' | 'manual' | string, avatar?: string) => void;
  loginAsGuest: () => void;
  updateAvatar: (newAvatarUrl: string) => void;
  integrations: ConnectedApp[];
  toggleIntegration: (id: string) => void;
  selectedContexts: string[];
  setSelectedContexts: React.Dispatch<React.SetStateAction<string[]>>;
  onboardingCompleted: boolean;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  deleteAccount: () => Promise<void>;
  isGuestModalOpen: boolean;
  guestActionName: string;
  openGuestModal: (actionTitle?: string) => void;
  closeGuestModal: () => void;
  requireAuth: (actionTitle?: string) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isGuest, setIsGuest] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('nexus_is_guest') === 'true';
    }
    return false;
  });

  const [isGuestModalOpen, setIsGuestModalOpen] = useState<boolean>(false);
  const [guestActionName, setGuestActionName] = useState<string>('');

  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const isGuestMode = localStorage.getItem('nexus_is_guest') === 'true';
      const isDone = localStorage.getItem('nexus_onboarding_done') === 'true';
      const hasSavedEmail = Boolean(localStorage.getItem('nexus_user_email'));
      const isRemembered = localStorage.getItem('nexus_remember_me') !== 'false';
      return isGuestMode || isDone || (hasSavedEmail && isRemembered);
    }
    return false;
  });

  const [user, setUser] = useState<UserProfile>(() => {
    const isGuestMode = typeof window !== 'undefined' && localStorage.getItem('nexus_is_guest') === 'true';
    if (isGuestMode) {
      return {
        name: 'زائر / ضيف (Guest)',
        email: 'guest@nexus.ai',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        role: 'مستكشف تجريبي (وضع الضيف)',
        authMethod: 'guest',
        activeContextsCount: 2,
        connectedAppsCount: 2,
        weeklyNotificationsCount: 3,
        avgFocusIndex: 75,
        isGuest: true,
      };
    }

    const savedEmail = typeof window !== 'undefined' ? localStorage.getItem('nexus_user_email') : null;
    const savedName = typeof window !== 'undefined' ? localStorage.getItem('nexus_user_name') : null;
    const savedAvatar = typeof window !== 'undefined' ? localStorage.getItem('nexus_user_avatar') : null;
    const savedMethod = typeof window !== 'undefined' ? (localStorage.getItem('nexus_auth_method') as 'google' | 'manual') : null;

    return {
      name: savedName || 'مالك التطبيق (Administrator)',
      email: (savedEmail || 'xxx230641@gmail.com').trim().toLowerCase(),
      avatar: savedAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      role: 'مدير مشاريع وتقنيات AI',
      authMethod: savedMethod || 'google',
      activeContextsCount: 3,
      connectedAppsCount: 6,
      weeklyNotificationsCount: 12,
      avgFocusIndex: 85,
      isGuest: false,
    };
  });

  const [integrations, setIntegrations] = useState<ConnectedApp[]>([
    { id: 'whatsapp', name: 'WhatsApp', nameAr: 'واتساب', category: 'messaging', connected: true, icon: 'MessageCircle', itemsCount: 142, lastSync: 'الآن' },
    { id: 'telegram', name: 'Telegram', nameAr: 'تليجرام', category: 'messaging', connected: true, icon: 'Send', itemsCount: 89, lastSync: 'منذ ٥ د' },
    { id: 'google', name: 'Gmail & Workspace', nameAr: 'بريد جي ميل ومساحة جوجل', category: 'work', connected: true, icon: 'Mail', itemsCount: 312, lastSync: 'منذ دقيقة', requiredForOnboarding: true },
    { id: 'calendar', name: 'Google Calendar', nameAr: 'تقويم جوجل', category: 'work', connected: true, icon: 'Calendar', itemsCount: 48, lastSync: 'الآن' },
    { id: 'slack', name: 'Slack', nameAr: 'سلاك للعمل', category: 'work', connected: true, icon: 'MessageSquare', itemsCount: 205, lastSync: 'منذ ١٥ د' },
    { id: 'notion', name: 'Notion Workspace', nameAr: 'مستندات نوشن', category: 'work', connected: true, icon: 'FileText', itemsCount: 64, lastSync: 'منذ ساعة' },
    { id: 'teams', name: 'Microsoft Teams', nameAr: 'مايكروسوفت تيمز', category: 'work', connected: false, icon: 'Users', itemsCount: 0, lastSync: 'غير متصل' },
    { id: 'zoom', name: 'Zoom Meetings', nameAr: 'اجتماعات زوم', category: 'work', connected: false, icon: 'Video', itemsCount: 0, lastSync: 'غير متصل' },
    { id: 'phone_calls', name: 'Phone Calls & Contacts', nameAr: 'مكالمات وجوهات الاتصال', category: 'system', connected: true, icon: 'PhoneCall', itemsCount: 520, lastSync: 'الآن' },
    { id: 'sms', name: 'SMS Messages', nameAr: 'الرسائل النصية SMS', category: 'system', connected: true, icon: 'MessageSquareText', itemsCount: 178, lastSync: 'منذ ٣٠ د' },
    { id: 'phone_notes', name: 'Phone Notes & Reminders', nameAr: 'ملاحظات وتذكيرات الهاتف', category: 'system', connected: true, icon: 'CheckSquare', itemsCount: 35, lastSync: 'منذ ساعتين' },
    { id: 'gps_location', name: 'Device GPS Location', nameAr: 'الموقع الجغرافي للهاتف', category: 'system', connected: true, icon: 'MapPin', itemsCount: 12, lastSync: 'الآن' },
    { id: 'health', name: 'Apple Health / Google Fit', nameAr: 'صحة ولياقة الهاتف', category: 'health', connected: true, icon: 'Heart', itemsCount: 7, lastSync: 'الآن' },
    { id: 'spotify', name: 'Spotify & Music', nameAr: 'سبوتيفاي والموسيقى', category: 'health', connected: false, icon: 'Music', itemsCount: 0, lastSync: 'غير متصل' },
    { id: 'gallery', name: 'Gallery & Photos', nameAr: 'معرض الصور والكاميرا', category: 'health', connected: false, icon: 'Image', itemsCount: 0, lastSync: 'غير متصل' },
    { id: 'maps', name: 'Navigation & Maps', nameAr: 'الخرائط والتنقل', category: 'system', connected: true, icon: 'Compass', itemsCount: 24, lastSync: 'منذ ساعة' },
  ]);

  const [selectedContexts, setSelectedContexts] = useState<string[]>(['professional', 'family', 'learning']);

  const toggleIntegration = (id: string) => {
    if (isGuest || user.authMethod === 'guest' || user.isGuest) {
      openGuestModal('ربط وتوصيل التطبيقات الخارجية');
      return;
    }
    setIntegrations((prev) =>
      prev.map((app) => (app.id === id ? { ...app, connected: !app.connected, lastSync: !app.connected ? 'الآن' : 'غير متصل' } : app))
    );
  };

  const completeOnboarding = () => {
    setOnboardingCompleted(true);
    localStorage.setItem('nexus_onboarding_done', 'true');
  };

  const loginUser = (email: string, name?: string, method: 'google' | 'microsoft' | 'apple' | 'github' | 'manual' | string = 'manual', avatar?: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const displayName = name || cleanEmail.split('@')[0];
    localStorage.setItem('nexus_user_email', cleanEmail);
    localStorage.setItem('nexus_user_name', displayName);
    localStorage.setItem('nexus_auth_method', method);
    localStorage.setItem('nexus_onboarding_done', 'true');
    localStorage.setItem('nexus_remember_me', 'true');
    localStorage.setItem('nexus_is_guest', 'false');
    setIsGuest(false);
    if (avatar) {
      localStorage.setItem('nexus_user_avatar', avatar);
    }

    setUser((prev) => ({
      ...prev,
      email: cleanEmail,
      name: displayName,
      authMethod: method,
      avatar: avatar || prev.avatar,
      isGuest: false,
    }));
    setOnboardingCompleted(true);
  };

  const loginAsGuest = () => {
    localStorage.setItem('nexus_is_guest', 'true');
    localStorage.setItem('nexus_onboarding_done', 'true');
    localStorage.setItem('nexus_user_name', 'زائر / ضيف (Guest)');
    localStorage.setItem('nexus_user_email', 'guest@nexus.ai');
    localStorage.setItem('nexus_auth_method', 'guest');
    setIsGuest(true);

    setUser({
      name: 'زائر / ضيف (Guest)',
      email: 'guest@nexus.ai',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      role: 'مستكشف تجريبي (وضع الضيف)',
      authMethod: 'guest',
      activeContextsCount: 2,
      connectedAppsCount: 2,
      weeklyNotificationsCount: 3,
      avgFocusIndex: 75,
      isGuest: true,
    });
    setOnboardingCompleted(true);
  };

  const updateAvatar = (newAvatarUrl: string) => {
    localStorage.setItem('nexus_user_avatar', newAvatarUrl);
    setUser((prev) => ({ ...prev, avatar: newAvatarUrl }));
  };

  const resetOnboarding = () => {
    localStorage.setItem('nexus_is_guest', 'false');
    setIsGuest(false);
    setOnboardingCompleted(false);
    localStorage.setItem('nexus_onboarding_done', 'false');
  };

  const openGuestModal = (actionTitle?: string) => {
    setGuestActionName(actionTitle || '');
    setIsGuestModalOpen(true);
  };

  const closeGuestModal = () => {
    setIsGuestModalOpen(false);
  };

  const requireAuth = (actionTitle?: string): boolean => {
    if (isGuest || user.authMethod === 'guest' || user.isGuest) {
      openGuestModal(actionTitle);
      return false;
    }
    return true;
  };

  const deleteAccount = async () => {
    try {
      const currentEmail = user.email || localStorage.getItem('nexus_user_email');
      await fetch('/api/auth/delete-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + (localStorage.getItem('nexus_token') || 'token'),
        },
        body: JSON.stringify({ email: currentEmail }),
      });

      localStorage.clear();
      localStorage.setItem('nexus_onboarding_done', 'false');
    } catch (e) {
      console.error('Storage clear error:', e);
    }
    setIsGuest(false);
    setOnboardingCompleted(false);
    setUser({
      name: 'مستخدم جديد',
      email: '',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      role: 'مستخدم Nexus AI',
      authMethod: 'manual',
      activeContextsCount: 0,
      connectedAppsCount: 0,
      weeklyNotificationsCount: 0,
      avgFocusIndex: 0,
      isGuest: false,
    });
  };

  useEffect(() => {
    const activeApps = integrations.filter((a) => a.connected).length;
    setUser((prev) => ({
      ...prev,
      connectedAppsCount: activeApps,
      activeContextsCount: selectedContexts.length,
    }));
  }, [integrations, selectedContexts]);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isGuest,
        loginUser,
        loginAsGuest,
        updateAvatar,
        integrations,
        toggleIntegration,
        selectedContexts,
        setSelectedContexts,
        onboardingCompleted,
        completeOnboarding,
        resetOnboarding,
        deleteAccount,
        isGuestModalOpen,
        guestActionName,
        openGuestModal,
        closeGuestModal,
        requireAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
