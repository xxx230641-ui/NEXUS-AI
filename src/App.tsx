import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import './lib/i18n';
import { useAuth, AuthProvider } from './hooks/useAuth';
import { useLang } from './hooks/useLang';
import { ThemeProvider, useTheme } from './hooks/useTheme';
import { NotificationProvider, useNotifications } from './hooks/useNotifications';

import { Sidebar } from './components/layout/Sidebar';
import { BottomNav } from './components/layout/BottomNav';
import { TopBar } from './components/layout/TopBar';

import { Onboarding } from './pages/Onboarding';
import { Dashboard } from './pages/Dashboard';
import { ContextGraphPage } from './pages/ContextGraphPage';
import { NotificationsPage } from './pages/Notifications';
import { Profile } from './pages/Profile';
import { SettingsPage } from './pages/Settings';
import { HelpCenter } from './pages/HelpCenter';
import { AdminDashboard } from './pages/AdminDashboard';
import { AIAssistantModal } from './components/ui/AIAssistantModal';
import { NotificationToast } from './components/ui/NotificationToast';
import { GuestRestrictionModal } from './components/ui/GuestRestrictionModal';

function AppContent() {
  const { lang, setLang } = useLang();
  const { theme, setTheme, accent, setAccent, bgPattern } = useTheme();
  const {
    onboardingCompleted,
    completeOnboarding,
    resetOnboarding,
    user,
    isGuest,
    isGuestModalOpen,
    closeGuestModal,
    guestActionName,
  } = useAuth();
  const { unreadCount } = useNotifications();

  const [currentPage, setCurrentPage] = useState<string>('dashboard');
  const [pageHistory, setPageHistory] = useState<string[]>(['dashboard']);
  const [activeContext, setActiveContext] = useState<string>('professional');
  const [isAIModalOpen, setIsAIModalOpen] = useState<boolean>(false);

  const handleNavigate = (page: string) => {
    if (page === currentPage) return;
    setPageHistory((prev) => [...prev, page]);
    setCurrentPage(page);
  };

  const handleGoBack = () => {
    if (pageHistory.length > 1) {
      const newHistory = [...pageHistory];
      newHistory.pop(); // remove current page
      const previousPage = newHistory[newHistory.length - 1];
      setPageHistory(newHistory);
      setCurrentPage(previousPage);
    } else {
      setPageHistory(['dashboard']);
      setCurrentPage('dashboard');
    }
  };

  const handleOpenAIModal = () => {
    setIsAIModalOpen(true);
  };

  if (!onboardingCompleted) {
    return <Onboarding onComplete={completeOnboarding} />;
  }

  return (
    <div
      dir="rtl"
      className={`min-h-screen text-[var(--text-primary)] flex flex-col lg:flex-row antialiased transition-colors duration-300 bg-pattern-${bgPattern}`}
    >
      {/* Desktop Persistent Sidebar (Right side in Arabic RTL, Left side in English LTR) */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onOpenAIModal={handleOpenAIModal}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen pb-20 lg:pb-8">
        {/* TopBar Header with Back Button */}
        <TopBar
          currentPage={currentPage}
          onNavigate={handleNavigate}
          onGoBack={handleGoBack}
          canGoBack={pageHistory.length > 1 || currentPage !== 'dashboard'}
          activeContext={activeContext}
          onContextChange={(ctx) => setActiveContext(ctx)}
          userName={user.name}
          userAvatar={user.avatar}
          onOpenDailyReport={() => {
            handleNavigate('dashboard');
          }}
        />

        {/* Guest Mode Persistent Banner */}
        {isGuest && (
          <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 py-2.5 flex items-center justify-between text-xs font-bold text-amber-700 dark:text-amber-300">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-amber-500 text-white font-black text-[10px]">
                {lang === 'ar' ? 'وضع الضيف' : 'Guest Mode'}
              </span>
              <span className="truncate">
                {lang === 'ar'
                  ? 'أنت تتصفح التطبيق كضيف. الميزات المتقدمة وتدوين المقابلات الحية تتطلب حساباً.'
                  : 'Browsing as Guest. Advanced live features require account sign in.'}
              </span>
            </div>
            <button
              type="button"
              onClick={resetOnboarding}
              className="px-3 py-1 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs transition-all shadow-xs cursor-pointer shrink-0"
            >
              {lang === 'ar' ? '🔑 تسجيل الدخول' : '🔑 Sign In'}
            </button>
          </div>
        )}

        {/* View Page Router with Animated Transitions */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              {currentPage === 'dashboard' && (
                <Dashboard
                  onNavigate={handleNavigate}
                  activeContext={activeContext as any}
                  onContextChange={(ctx) => setActiveContext(ctx)}
                  onOpenAIModal={() => setIsAIModalOpen(true)}
                />
              )}
              {currentPage === 'graph' && <ContextGraphPage />}
              {currentPage === 'admin' && (
                (user?.email || '').trim().toLowerCase() === 'xxx230641@gmail.com' ? (
                  <AdminDashboard />
                ) : (
                  <div className="p-8 max-w-lg mx-auto text-center space-y-4 my-12 bg-[var(--bg-surface)] border border-red-500/30 rounded-3xl shadow-xl animate-fade-in">
                    <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-500 mx-auto flex items-center justify-center font-black text-2xl">
                      🚫
                    </div>
                    <h2 className="text-lg font-black text-[var(--text-primary)]">
                      {lang === 'ar' ? 'غير مصرح بالدخول للوحة التحكم' : 'Access Restricted to Owner'}
                    </h2>
                    <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                      {lang === 'ar'
                        ? 'لوحة التحكم حصرية بحساب مالك التطبيق الرئيسي (xxx230641@gmail.com). الرجاء تسجيل الدخول ببريد المالك لإدارة النظام.'
                        : 'Admin Panel is restricted strictly to the application owner (xxx230641@gmail.com).'}
                    </p>
                    <button
                      onClick={() => handleNavigate('dashboard')}
                      className="px-4 py-2 rounded-xl bg-[var(--accent)] text-white font-bold text-xs hover:opacity-90 transition-opacity cursor-pointer"
                    >
                      {lang === 'ar' ? 'العودة للرئيسية' : 'Return to Home'}
                    </button>
                  </div>
                )
              )}
              {currentPage === 'notifications' && <NotificationsPage />}
              {currentPage === 'profile' && <Profile />}
              {currentPage === 'settings' && (
                <SettingsPage
                  onNavigate={handleNavigate}
                  onResetOnboarding={resetOnboarding}
                />
              )}
              {currentPage === 'help' && <HelpCenter />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Floating AI Digital Twin Assistant Widget with Full Control Authority */}
      <AIAssistantModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        onToggle={() => setIsAIModalOpen((prev) => !prev)}
        activeContext={activeContext}
        onNavigate={handleNavigate}
        onSetTheme={(t) => setTheme(t)}
        onSetAccent={(a) => setAccent(a)}
        onSetLang={(l) => setLang(l)}
        onSwitchContext={(ctx) => setActiveContext(ctx.toLowerCase())}
      />

      {/* Mobile Bottom Navigation Bar (4 Items: Home, Graph, Notifications, Profile) */}
      <BottomNav
        currentPage={currentPage}
        onNavigate={handleNavigate}
        unreadCount={unreadCount}
      />

      {/* Guest Mode Restricted Feature Prompt Modal */}
      <GuestRestrictionModal
        isOpen={isGuestModalOpen}
        onClose={closeGuestModal}
        onGoToLogin={resetOnboarding}
        actionTitle={guestActionName}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <NotificationProvider>
          <AppContent />
        </NotificationProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
