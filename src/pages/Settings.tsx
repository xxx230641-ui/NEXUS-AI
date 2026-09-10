import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Settings as SettingsIcon,
  Sun,
  Moon,
  Globe,
  HelpCircle,
  ShieldAlert,
  RotateCcw,
  Check,
  Palette,
  User,
  AlertTriangle,
  X,
  Bell,
  BellOff,
  Sparkles,
  Zap,
  CheckSquare,
  Shield,
  Layout,
  SlidersHorizontal,
  Calendar,
  FileJson,
  FileText,
  Download,
  Upload,
  LogOut,
  Server,
  Cpu,
  Cloud,
  Terminal,
  Copy,
  Smartphone,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useTheme, ACCENT_PALETTES, AccentColor, BG_PATTERNS, BgPattern } from '../hooks/useTheme';
import { useLang } from '../hooks/useLang';
import { useAuth } from '../hooks/useAuth';
import { downloadHtmlReport } from '../utils/exportReport';
import { useNotifications } from '../hooks/useNotifications';

interface SettingsProps {
  onNavigate: (page: string) => void;
  onResetOnboarding: () => void;
}

type SettingCategory = 'appearance' | 'performance' | 'hosting' | 'notifications' | 'account' | 'security';

export const SettingsPage: React.FC<SettingsProps> = ({ onNavigate, onResetOnboarding }) => {
  const { t } = useTranslation();
  const { theme, setTheme, accent, setAccent, bgPattern, setBgPattern } = useTheme();
  const { lang, setLang } = useLang();
  const { deleteAccount, user } = useAuth();
  const {
    notificationsEnabled,
    toggleNotificationsEnabled,
    categories,
    setCategorySetting,
    nativePermission,
    requestNativePermission,
  } = useNotifications();

  const [activeCategory, setActiveCategory] = useState<SettingCategory>('appearance');
  const [calendarType, setCalendarType] = useState<'dual' | 'gregorian' | 'hijri'>('dual');
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);
  const [showDeleteAccountConfirm, setShowDeleteAccountConfirm] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleFactoryReset = () => {
    localStorage.clear();
    setShowResetConfirm(false);
    triggerToast(
      lang === 'ar'
        ? 'تم مسح كافة البيانات محلياً وإعادة الضبط بنجاح.'
        : 'All local data purged and system reset successfully.'
    );
    setTimeout(() => {
      onResetOnboarding();
    }, 1000);
  };

  const handleExportFormattedReport = () => {
    downloadHtmlReport({
      title: lang === 'ar' ? 'تقرير بيانات ومواصفات التوأم الرقمي' : 'NEXUS Digital Twin System Executive Report',
      subtitle: lang === 'ar' ? 'ملخص الحساب، تفضيلات المظهر المعتمدة، والموصلات النشطة' : 'Account Identity, UI Theme Configs & Active Connectors Summary',
      filename: `nexus_executive_system_report_${new Date().toISOString().slice(0, 10)}.html`,
      lang: lang === 'ar' ? 'ar' : 'en',
      sections: [
        {
          title: lang === 'ar' ? 'معلومات الحساب والمستخدم' : 'User Profile Information',
          metrics: [
            { label: lang === 'ar' ? 'اسم المستخدم' : 'User Name', value: user.name || 'Alex Mercer', color: 'indigo' },
            { label: lang === 'ar' ? 'البريد الإلكتروني' : 'Email', value: user.email || 'xxx230641@gmail.com', color: 'cyan' },
            { label: lang === 'ar' ? 'الصلاحية والتشغيل' : 'Role', value: user.role || 'Executive Admin', color: 'emerald' },
          ],
        },
        {
          title: lang === 'ar' ? 'تفضيلات النظام والمظهر' : 'System Theme & Preferences Table',
          table: {
            headers: [
              lang === 'ar' ? 'العنصر' : 'Setting Item',
              lang === 'ar' ? 'القيمة المعتمدة' : 'Current Configured Value',
              lang === 'ar' ? 'التفاصيل التنفيذية' : 'Executive Description',
            ],
            rows: [
              [lang === 'ar' ? 'مظهر الواجهة' : 'UI Theme', theme === 'dark' ? (lang === 'ar' ? 'الوضع الليلي (Dark)' : 'Dark Mode') : (lang === 'ar' ? 'الوضع النهاري (Light)' : 'Light Mode'), lang === 'ar' ? 'مظهر خلفية الشاشة واللوحات' : 'Canvas contrast style'],
              [lang === 'ar' ? 'لون التمييز' : 'Accent Color', accent, lang === 'ar' ? 'اللون التميزي للأزرار والأيقونات' : 'Primary UI highlight color'],
              [lang === 'ar' ? 'نمط التقويم' : 'Calendar Type', calendarType === 'dual' ? (lang === 'ar' ? 'تقويم مزدوج (ميلادي وهجري)' : 'Dual (Gregorian & Hijri)') : calendarType === 'hijri' ? (lang === 'ar' ? 'هجري فقط' : 'Hijri Only') : (lang === 'ar' ? 'ميلادي فقط' : 'Gregorian Only'), lang === 'ar' ? 'طريقة عرض وتواريخ التقرير' : 'Date rendering mode'],
              [lang === 'ar' ? 'نظام الإشعارات' : 'Notifications System', notificationsEnabled ? (lang === 'ar' ? 'نشط ومفعل ✓' : 'Enabled ✓') : (lang === 'ar' ? 'معطل' : 'Disabled'), lang === 'ar' ? 'التنبيهات المباشرة التلقائية' : 'Live system alerts'],
            ],
          },
        },
        {
          title: lang === 'ar' ? 'الموصلات وشبكة المعرفة العصبي' : 'Active System Connectors',
          bullets: [
            lang === 'ar' ? '• Google Workspace: متصل تلقائياً مع التقويم والبريد الإلكتروني.' : '• Google Workspace: Connected to Google Calendar & Gmail.',
            lang === 'ar' ? '• Slack & WhatsApp & Notion: مزامنة وتحليل الرسائل والملاحظات الحية.' : '• Slack, WhatsApp & Notion: Live context extraction active.',
            lang === 'ar' ? '• شبكة المعرفة (Knowledge Graph): تتضمن جميع الكيانات والاجتماعات الموثقة.' : '• Context Knowledge Graph: All extracted entities safely stored.',
          ],
        },
      ],
    });

    triggerToast(
      lang === 'ar'
        ? 'تم تنزيل تقرير بيانات النظام بصيغة جدول تفاعلي ومستند منسق 📄'
        : 'Formatted executive data report downloaded 📄'
    );
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        triggerToast(
          lang === 'ar'
            ? `تم التحقق واستيراد نسخة البيانات (${parsed.appName || 'NEXUS'}) بنجاح ✓`
            : 'JSON backup validated and restored successfully ✓'
        );
      } catch (err) {
        triggerToast(lang === 'ar' ? 'خطأ: ملف JSON غير صالح' : 'Error: Invalid JSON file format');
      }
    };
    reader.readAsText(file);
  };

  const [smoothPerformanceMode, setSmoothPerformanceMode] = useState<boolean>(() => {
    return localStorage.getItem('nexus_smooth_mode') !== 'false';
  });
  const [gpuAccel, setGpuAccel] = useState<boolean>(() => {
    return localStorage.getItem('nexus_gpu_accel') !== 'false';
  });
  const [selectedHostingFilter, setSelectedHostingFilter] = useState<'all' | 'static' | 'server' | 'docker'>('all');

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    triggerToast(lang === 'ar' ? `تم نسخ (${label}) إلى الحافظة 📋` : `Copied (${label}) to clipboard 📋`);
  };

  const categoryTabs = [
    {
      id: 'appearance' as SettingCategory,
      titleAr: 'المظهر واللغة',
      titleEn: 'Appearance & Language',
      icon: Palette,
      descAr: 'الثيم والألوان واللغات',
      descEn: 'Theme, colors & language',
    },
    {
      id: 'performance' as SettingCategory,
      titleAr: 'الأداء السلس للهواتف',
      titleEn: 'Mobile Performance',
      icon: Cpu,
      descAr: 'تسريع الأجهزة والذاكرة',
      descEn: 'Hardware acceleration & RAM',
    },
    {
      id: 'notifications' as SettingCategory,
      titleAr: 'الإشعارات والتنبيهات',
      titleEn: 'Notifications & Alerts',
      icon: Bell,
      descAr: 'تنبيهات النظام والمتصفح',
      descEn: 'System & push alerts',
    },
    {
      id: 'account' as SettingCategory,
      titleAr: 'الحساب والدعم',
      titleEn: 'Account & Support',
      icon: User,
      descAr: 'الملف الشخصي والدليل',
      descEn: 'Profile & manual',
    },
    {
      id: 'security' as SettingCategory,
      titleAr: 'الأمان وإعادة الضبط',
      titleEn: 'Security & Reset',
      icon: ShieldAlert,
      descAr: 'إعادة الضبط وحذف الحساب',
      descEn: 'Reset & deletion',
    },
  ];

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Toast feedback */}
      {toastMessage && (
        <div className="p-3.5 bg-[var(--success)] text-white rounded-xl text-center text-xs font-bold shadow-lg animate-fade-in">
          ✓ {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] flex items-center gap-2.5">
            <SettingsIcon className="w-8 h-8 text-[var(--accent)]" />
            {t('settings.title')}
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            {lang === 'ar'
              ? 'إدارة متكاملة ومنظمة لكافة إعدادات التطبيق والحساب'
              : 'Unified and organized management for all app and account preferences'}
          </p>
        </div>

        {/* Return to Login Screen Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            triggerToast(lang === 'ar' ? 'جاري العودة لصفحة تسجيل الدخول...' : 'Redirecting to login screen...');
            setTimeout(() => {
              onResetOnboarding();
            }, 400);
          }}
          icon={<LogOut className="w-4 h-4 text-indigo-500" />}
          className="shrink-0 border-indigo-500/40 hover:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-extrabold"
        >
          {lang === 'ar' ? 'العودة لصفحة تسجيل الدخول 🔑' : 'Return to Login Page 🔑'}
        </Button>
      </div>

      {/* Unified Category Selector Navigation */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 bg-[var(--bg-surface)] p-2 rounded-2xl border border-[var(--border-subtle)] shadow-xs">
        {categoryTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeCategory === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id)}
              className={`
                p-3 rounded-xl flex flex-col items-center sm:items-start text-center sm:text-start gap-1.5 transition-all cursor-pointer border
                ${
                  isActive
                    ? 'bg-[var(--accent)] text-white border-[var(--accent)] shadow-md'
                    : 'bg-[var(--bg-hover)] text-[var(--text-primary)] border-transparent hover:border-[var(--border-subtle)]'
                }
              `}
            >
              <div className="flex items-center gap-2 font-bold text-xs sm:text-sm">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[var(--accent)]'}`} />
                <span className="truncate">{lang === 'ar' ? tab.titleAr : tab.titleEn}</span>
              </div>
              <span
                className={`text-[10px] hidden sm:block ${
                  isActive ? 'text-white/80' : 'text-[var(--text-muted)]'
                }`}
              >
                {lang === 'ar' ? tab.descAr : tab.descEn}
              </span>
            </button>
          );
        })}
      </div>

      {/* CATEGORY 1: APPEARANCE & LANGUAGE */}
      {activeCategory === 'appearance' && (
        <Card className="space-y-6 animate-fade-in">
          <div className="border-b border-[var(--border-subtle)] pb-3">
            <h3 className="text-base font-extrabold text-[var(--text-primary)] flex items-center gap-2">
              <Palette className="w-5 h-5 text-[var(--accent)]" />
              {lang === 'ar' ? 'المظهر وتخصيص الواجهة واللغة' : 'Appearance & Language Customization'}
            </h3>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              {lang === 'ar'
                ? 'تجميع متناسق للوضع الإضاءي، ألوان التمييز، خلفيات التطبيق واللغة المفضلة'
                : 'Unified options for theme mode, accent colors, patterns, and language.'}
            </p>
          </div>

          {/* Light vs Dark Mode */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[var(--text-secondary)] block">
              {lang === 'ar' ? 'نمط الإضاءة' : 'Theme Mode'}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setTheme('light');
                  triggerToast(lang === 'ar' ? 'تم تفعيل الوضع النهاري' : 'Light theme enabled');
                }}
                className={`
                  p-3.5 rounded-xl border-2 flex items-center justify-between cursor-pointer transition-all
                  ${
                    theme === 'light'
                      ? 'border-[var(--accent)] bg-[var(--bg-hover)] shadow-sm'
                      : 'border-[var(--border-subtle)] hover:border-[var(--border-default)]'
                  }
                `}
              >
                <div className="flex items-center gap-2.5">
                  <Sun className="w-5 h-5 text-amber-500" />
                  <span className="text-sm font-bold text-[var(--text-primary)]">
                    {t('settings.themeLight')}
                  </span>
                </div>
                {theme === 'light' && <Check className="w-4 h-4 text-[var(--accent)]" />}
              </button>

              <button
                onClick={() => {
                  setTheme('dark');
                  triggerToast(lang === 'ar' ? 'تم تفعيل الوضع الليلي' : 'Dark theme enabled');
                }}
                className={`
                  p-3.5 rounded-xl border-2 flex items-center justify-between cursor-pointer transition-all
                  ${
                    theme === 'dark'
                      ? 'border-[var(--accent)] bg-[var(--bg-hover)] shadow-sm'
                      : 'border-[var(--border-subtle)] hover:border-[var(--border-default)]'
                  }
                `}
              >
                <div className="flex items-center gap-2.5">
                  <Moon className="w-5 h-5 text-indigo-400" />
                  <span className="text-sm font-bold text-[var(--text-primary)]">
                    {t('settings.themeDark')}
                  </span>
                </div>
                {theme === 'dark' && <Check className="w-4 h-4 text-[var(--accent)]" />}
              </button>
            </div>
          </div>

          {/* System Language Selector */}
          <div className="space-y-2 pt-3 border-t border-[var(--border-subtle)]">
            <label className="text-xs font-bold text-[var(--text-secondary)] block flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-[var(--accent)]" />
              {t('settings.language')}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setLang('ar');
                  triggerToast('تمت التغيير إلى اللغة العربية');
                }}
                className={`
                  p-3.5 rounded-xl border-2 flex items-center justify-between cursor-pointer transition-all
                  ${
                    lang === 'ar'
                      ? 'border-[var(--accent)] bg-[var(--bg-hover)] shadow-sm'
                      : 'border-[var(--border-subtle)] hover:border-[var(--border-default)]'
                  }
                `}
              >
                <span className="text-sm font-bold text-[var(--text-primary)]">
                  {t('settings.arabic')}
                </span>
                {lang === 'ar' && <Check className="w-4 h-4 text-[var(--accent)]" />}
              </button>

              <button
                onClick={() => {
                  setLang('en');
                  triggerToast('Language changed to English');
                }}
                className={`
                  p-3.5 rounded-xl border-2 flex items-center justify-between cursor-pointer transition-all
                  ${
                    lang === 'en'
                      ? 'border-[var(--accent)] bg-[var(--bg-hover)] shadow-sm'
                      : 'border-[var(--border-subtle)] hover:border-[var(--border-default)]'
                  }
                `}
              >
                <span className="text-sm font-bold text-[var(--text-primary)]">
                  {t('settings.english')}
                </span>
                {lang === 'en' && <Check className="w-4 h-4 text-[var(--accent)]" />}
              </button>
            </div>
          </div>

          {/* Accent Color Palette Switcher */}
          <div className="space-y-3 pt-3 border-t border-[var(--border-subtle)]">
            <label className="text-xs font-bold text-[var(--text-secondary)] block">
              {lang === 'ar' ? 'لون التمييز الرئيسي (Accent Color)' : 'Primary Accent Color'}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
              {(Object.keys(ACCENT_PALETTES) as AccentColor[]).map((key) => {
                const pal = ACCENT_PALETTES[key];
                const isSelected = accent === key;
                return (
                  <button
                    key={key}
                    onClick={() => {
                      setAccent(key);
                      triggerToast(
                        lang === 'ar'
                          ? `تم تغيير اللون الرئيسي إلى: ${pal.nameAr}`
                          : `Accent color changed to: ${pal.nameEn}`
                      );
                    }}
                    className={`
                      p-3 rounded-2xl border-2 flex flex-col items-center gap-2 cursor-pointer transition-all text-center
                      ${
                        isSelected
                          ? 'border-[var(--text-primary)] bg-[var(--bg-hover)] shadow-md scale-105'
                          : 'border-[var(--border-subtle)] hover:border-[var(--border-default)]'
                      }
                    `}
                  >
                    <span
                      className="w-6 h-6 rounded-full shadow-inner border border-black/10 flex items-center justify-center"
                      style={{ backgroundColor: theme === 'dark' ? pal.darkHex : pal.lightHex }}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                    </span>
                    <span className="text-xs font-bold text-[var(--text-primary)]">
                      {lang === 'ar' ? pal.nameAr : pal.nameEn}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Background Patterns Switcher */}
          <div className="space-y-3 pt-3 border-t border-[var(--border-subtle)]">
            <div className="space-y-0.5">
              <label className="text-xs font-bold text-[var(--text-secondary)] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[var(--accent)]" />
                {lang === 'ar' ? 'نمط الخلفية المزخرفة (Background Patterns)' : 'Decorative Background Pattern'}
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {(Object.keys(BG_PATTERNS) as BgPattern[]).map((key) => {
                const item = BG_PATTERNS[key];
                const isSelected = bgPattern === key;
                return (
                  <button
                    key={key}
                    onClick={() => {
                      setBgPattern(key);
                      triggerToast(
                        lang === 'ar'
                          ? `تم تفعيل خلفية: ${item.nameAr}`
                          : `Background pattern set to: ${item.nameEn}`
                      );
                    }}
                    className={`
                      p-3.5 rounded-2xl border-2 flex flex-col justify-between items-start gap-2.5 cursor-pointer transition-all text-right group relative overflow-hidden
                      ${
                        isSelected
                          ? 'border-[var(--accent)] bg-[var(--bg-hover)] shadow-md ring-2 ring-[var(--accent)]/20'
                          : 'border-[var(--border-subtle)] hover:border-[var(--border-default)] bg-[var(--bg-surface)]'
                      }
                    `}
                  >
                    <div className="w-full flex items-center justify-between z-10">
                      <span className="text-xs font-black text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                        {lang === 'ar' ? item.nameAr : item.nameEn}
                      </span>
                      {isSelected ? (
                        <div className="w-5 h-5 rounded-full bg-[var(--accent)] flex items-center justify-center text-white shadow-xs">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      ) : (
                        <span className="text-[10px] text-[var(--text-muted)] font-mono font-bold uppercase group-hover:text-[var(--text-secondary)]">
                          {key}
                        </span>
                      )}
                    </div>

                    {/* Pattern Live Visual Thumbnail */}
                    <div className={`w-full h-12 rounded-xl border border-[var(--border-subtle)] bg-pattern-${key} relative overflow-hidden flex items-center justify-center shadow-inner`}>
                      <div className="px-2 py-0.5 rounded-md bg-[var(--bg-surface)]/80 backdrop-blur-xs text-[9px] font-bold text-[var(--text-secondary)] border border-[var(--border-subtle)] shadow-2xs">
                        {lang === 'ar' ? 'معاينة الزخرفة' : 'Preview'}
                      </div>
                    </div>

                    <p className="text-[10px] text-[var(--text-muted)] leading-relaxed z-10">
                      {lang === 'ar' ? item.descAr : item.descEn}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Calendar System Preference */}
          <div className="pt-4 border-t border-[var(--border-subtle)] space-y-3">
            <div>
              <h4 className="text-xs font-black text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[var(--accent)]" />
                <span>{lang === 'ar' ? 'نظام التقويم المعتمد (الميلادي والهجري)' : 'Calendar System Preference'}</span>
              </h4>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                {lang === 'ar'
                  ? 'اختر طريقة عرض التواريخ والمواعيد عبر أجزاء التطبيق والتقارير التنفيذية'
                  : 'Choose how dates and scheduled briefings are presented across the executive suite'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  id: 'dual' as const,
                  titleAr: 'مزدوج (ميلادي + هجري)',
                  titleEn: 'Dual (Gregorian + Hijri)',
                  descAr: 'عرض التاريخين الميلادي والهجري معاً بتزامن كامل',
                  descEn: 'Show Gregorian & Hijri dates concurrently',
                  icon: '📅',
                },
                {
                  id: 'gregorian' as const,
                  titleAr: 'التقويم الميلادي',
                  titleEn: 'Gregorian Calendar',
                  descAr: 'اعتماد التقويم الميلادي كنظام أساسي موحد',
                  descEn: 'Use standard Gregorian calendar as primary',
                  icon: '🌐',
                },
                {
                  id: 'hijri' as const,
                  titleAr: 'التقويم الهجري',
                  titleEn: 'Hijri Calendar',
                  descAr: 'اعتماد التقويم الهجري الإسلامي كنظام أساسي',
                  descEn: 'Use Islamic Hijri calendar as primary',
                  icon: '☪️',
                },
              ].map((cal) => {
                const isSelected = calendarType === cal.id;
                return (
                  <button
                    key={cal.id}
                    onClick={() => {
                      setCalendarType(cal.id);
                      triggerToast(
                        lang === 'ar'
                          ? `تم اعتماد ${cal.titleAr} بنجاح`
                          : `Set calendar preference to ${cal.titleEn}`
                      );
                    }}
                    className={`
                      p-3.5 rounded-2xl border-2 flex flex-col justify-between items-start gap-2 cursor-pointer transition-all text-right
                      ${
                        isSelected
                          ? 'border-[var(--accent)] bg-[var(--bg-hover)] shadow-sm ring-2 ring-[var(--accent)]/20'
                          : 'border-[var(--border-subtle)] hover:border-[var(--border-default)] bg-[var(--bg-surface)]'
                      }
                    `}
                  >
                    <div className="w-full flex items-center justify-between">
                      <span className="text-xs font-black text-[var(--text-primary)] flex items-center gap-1.5">
                        <span>{cal.icon}</span>
                        <span>{lang === 'ar' ? cal.titleAr : cal.titleEn}</span>
                      </span>
                      {isSelected && <Check className="w-4 h-4 text-[var(--accent)] stroke-[3]" />}
                    </div>
                    <p className="text-[10px] text-[var(--text-muted)] leading-relaxed">
                      {lang === 'ar' ? cal.descAr : cal.descEn}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </Card>
      )}

      {/* CATEGORY 2: MOBILE PERFORMANCE & HARDWARE ACCELERATION */}
      {activeCategory === 'performance' && (
        <div className="space-y-6 animate-fade-in">
          <Card className="space-y-6 border-2 border-emerald-500/30">
            <div className="border-b border-[var(--border-subtle)] pb-3">
              <h3 className="text-base font-extrabold text-[var(--text-primary)] flex items-center gap-2">
                <Cpu className="w-5 h-5 text-emerald-500" />
                {lang === 'ar' ? 'الأداء السلس وتوفير موارد الهاتف' : 'Mobile Performance & Resource Saver'}
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                {lang === 'ar'
                  ? 'خيارات متقدمة لتسريع التطبيق على الهواتف القديمة والجديدة وتقليل استهلاك الذاكرة العشوائية (RAM) والبطارية.'
                  : 'Advanced optimizations to ensure silky-smooth performance and reduced RAM usage across all smartphone generations.'}
              </p>
            </div>

            <div className="space-y-4">
              {/* Ultra-Fast Smooth Performance Mode */}
              <div className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-emerald-500" />
                    <h4 className="text-sm font-extrabold text-[var(--text-primary)]">
                      {lang === 'ar' ? 'وضع الأداء السلس للهواتف (Ultra-Smooth Mode)' : 'Ultra-Smooth Performance Mode'}
                    </h4>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {lang === 'ar'
                      ? 'تفعيل الأداء الخفيف لتبسيط التأثيرات الرسومية الثقيلة وتسريع الاستجابة على الأجهزة الضعيفة.'
                      : 'Simplifies graphics effects and optimizes CSS renders for instant responsiveness on older hardware.'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    const nextVal = !smoothPerformanceMode;
                    setSmoothPerformanceMode(nextVal);
                    localStorage.setItem('nexus_smooth_mode', String(nextVal));
                    triggerToast(
                      nextVal
                        ? (lang === 'ar' ? 'تم تفعيل وضع الأداء السلس ⚡' : 'Ultra-smooth mode enabled ⚡')
                        : (lang === 'ar' ? 'تم تعطيل وضع الأداء السلس' : 'Ultra-smooth mode disabled')
                    );
                  }}
                  className={`px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer border ${
                    smoothPerformanceMode
                      ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm'
                      : 'bg-[var(--bg-hover)] text-[var(--text-muted)] border-[var(--border-subtle)]'
                  }`}
                >
                  {smoothPerformanceMode ? (lang === 'ar' ? 'مفعل ✓' : 'Active ✓') : (lang === 'ar' ? 'معطل' : 'Off')}
                </button>
              </div>

              {/* GPU Hardware Acceleration */}
              <div className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-500" />
                    <h4 className="text-sm font-extrabold text-[var(--text-primary)]">
                      {lang === 'ar' ? 'تسريع كرت الشاشة المعالجة GPU' : 'GPU Hardware Acceleration'}
                    </h4>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {lang === 'ar'
                      ? 'استخدام المعالجة الرسومية للجوال لمعالجة التنقلات وتأثيرات اللمس بسرعة 60 إطار في الثانية.'
                      : 'Utilize mobile hardware GPU layers for 60FPS fluid touch scrolling and instant animations.'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    const nextVal = !gpuAccel;
                    setGpuAccel(nextVal);
                    localStorage.setItem('nexus_gpu_accel', String(nextVal));
                    triggerToast(
                      nextVal
                        ? (lang === 'ar' ? 'تم تفعيل تسريع المعالج الرسومي GPU 🚀' : 'GPU acceleration enabled 🚀')
                        : (lang === 'ar' ? 'تم إيقاف تسريع المعالج الرسومي' : 'GPU acceleration disabled')
                    );
                  }}
                  className={`px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer border ${
                    gpuAccel
                      ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                      : 'bg-[var(--bg-hover)] text-[var(--text-muted)] border-[var(--border-subtle)]'
                  }`}
                >
                  {gpuAccel ? (lang === 'ar' ? 'مفعل ✓' : 'Active ✓') : (lang === 'ar' ? 'معطل' : 'Off')}
                </button>
              </div>

              {/* Memory Diagnostics & Quick Flush */}
              <div className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    {lang === 'ar' ? 'حالة ذاكرة التطبيق والتخزين المؤقت' : 'App Memory & Cache Diagnostics'}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black border border-emerald-500/20">
                    {lang === 'ar' ? 'ممتازة ⚡' : 'Optimal ⚡'}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-muted)]">
                  {lang === 'ar'
                    ? 'التطبيق مبني بنظام Chunk Splitting لتأمين سرعة تحميل خرافية تجعل حجم الصفحات يقل عن 100 كيلوبايت على كافة الشبكات والهواتف.'
                    : 'The app uses chunk splitting and tree-shaking to keep bundle size below 100KB for rapid mobile loading on any connection.'}
                </p>
                <div className="pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      triggerToast(lang === 'ar' ? 'تم تحسين وتنظيف الذاكرة المؤقتة بنجاح 🧹' : 'RAM Cache cleaned successfully 🧹');
                    }}
                    icon={<RotateCcw className="w-3.5 h-3.5 text-emerald-500" />}
                  >
                    {lang === 'ar' ? 'تنظيف الذاكرة المؤقتة (Flush Memory Cache)' : 'Flush Memory Cache'}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* CATEGORY 4: NOTIFICATIONS & ALERTS */}
      {activeCategory === 'notifications' && (
        <Card className="space-y-6 border-2 border-[var(--accent)]/30 animate-fade-in">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-[var(--text-primary)] flex items-center gap-2">
                <Bell className="w-5 h-5 text-[var(--accent)]" />
                {lang === 'ar' ? 'إشعارات وتنبيهات النظام' : 'System Push Notifications'}
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                {lang === 'ar'
                  ? 'التحكم الشامل في إشعارات الجهاز، الأذونات وتفضيلات الفئات'
                  : 'Master control over browser permissions and category rules.'}
              </p>
            </div>

            <Button
              variant={notificationsEnabled ? 'danger' : 'primary'}
              size="sm"
              onClick={() => {
                toggleNotificationsEnabled();
                triggerToast(
                  !notificationsEnabled
                    ? lang === 'ar'
                      ? 'تم تفعيل إشعارات النظام بنجاح 🔔'
                      : 'System notifications enabled 🔔'
                    : lang === 'ar'
                    ? 'تم إيقاف/كتم كافة الإشعارات الخارجية 🔕'
                    : 'All push notifications muted/paused 🔕'
                );
              }}
              icon={notificationsEnabled ? <BellOff className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
            >
              {notificationsEnabled
                ? lang === 'ar'
                  ? 'كتم الإشعارات'
                  : 'Mute Notifications'
                : lang === 'ar'
                ? 'تفعيل الإشعارات'
                : 'Enable Notifications'}
            </Button>
          </div>

          {/* Browser Permission Info */}
          <div className="p-4 rounded-2xl bg-[var(--bg-hover)] border border-[var(--border-subtle)] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-[var(--text-primary)]">
                  {lang === 'ar' ? 'إذن متصفح الجهاز:' : 'Browser Permission:'}
                </span>
                <span
                  className={`text-[11px] font-extrabold px-2 py-0.5 rounded-md ${
                    nativePermission === 'granted'
                      ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                      : nativePermission === 'denied'
                      ? 'bg-red-500/20 text-red-500'
                      : 'bg-amber-500/20 text-amber-500'
                  }`}
                >
                  {nativePermission === 'granted'
                    ? lang === 'ar'
                      ? 'مسموح بها'
                      : 'Granted'
                    : nativePermission === 'denied'
                    ? 'محظورة'
                    : lang === 'ar'
                    ? 'يتطلب الإذن'
                    : 'Needs Permission'}
                </span>
              </div>
            </div>

            {nativePermission !== 'granted' && (
              <Button
                size="sm"
                variant="primary"
                onClick={async () => {
                  const granted = await requestNativePermission();
                  if (granted) {
                    triggerToast(lang === 'ar' ? 'تم منح إذن الإشعارات! 🎉' : 'Browser permission granted!');
                  }
                }}
                icon={<Bell className="w-4 h-4" />}
              >
                {lang === 'ar' ? 'طلب إذن الإشعارات' : 'Grant Push Permission'}
              </Button>
            )}
          </div>

          {/* Categories Toggles */}
          {notificationsEnabled && (
            <div className="space-y-3 pt-2">
              <label className="text-xs font-black text-[var(--text-secondary)] block">
                {lang === 'ar' ? 'تخصيص فئات التنبيهات المسموح بها:' : 'Notification Categories:'}
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    id: 'contextShifts' as const,
                    titleAr: 'تحوّل السياق',
                    titleEn: 'Context Shifts',
                    descAr: 'تنبيهات تغيير المنطقة أو التقويم',
                    descEn: 'Spatial or calendar context changes',
                    icon: Zap,
                    color: 'text-cyan-400',
                  },
                  {
                    id: 'conflicts' as const,
                    titleAr: 'تضارب المواعيد',
                    titleEn: 'Schedule Conflicts',
                    descAr: 'تحذيرات تقاطع الفعاليات والاجتماعات',
                    descEn: 'Alerts for overlapping events',
                    icon: AlertTriangle,
                    color: 'text-red-400',
                  },
                  {
                    id: 'aiBriefings' as const,
                    titleAr: 'تحليلات J.A.R.V.I.S',
                    titleEn: 'J.A.R.V.I.S Twin Insights',
                    descAr: 'الملخصات والتوصيات الذكية',
                    descEn: 'Smart daily summaries & advice',
                    icon: Sparkles,
                    color: 'text-amber-400',
                  },
                  {
                    id: 'tasks' as const,
                    titleAr: 'المهام والتركيز',
                    titleEn: 'Tasks & Focus Mode',
                    descAr: 'تذكيرات الإنجاز ووضع التركيز',
                    descEn: 'Task completions & focus alerts',
                    icon: CheckSquare,
                    color: 'text-emerald-400',
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  const isChecked = categories[item.id];
                  return (
                    <div
                      key={item.id}
                      onClick={() => setCategorySetting(item.id, !isChecked)}
                      className={`
                        p-3.5 rounded-2xl border flex items-center justify-between gap-3 cursor-pointer transition-all
                        ${
                          isChecked
                            ? 'bg-[var(--bg-surface)] border-[var(--accent)] shadow-sm'
                            : 'bg-[var(--bg-hover)] border-[var(--border-subtle)] opacity-60'
                        }
                      `}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`p-2 rounded-xl bg-[var(--bg-hover)] ${item.color} shrink-0`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="space-y-0.5 min-w-0">
                          <span className="text-xs font-extrabold text-[var(--text-primary)] block truncate">
                            {lang === 'ar' ? item.titleAr : item.titleEn}
                          </span>
                          <span className="text-[10px] text-[var(--text-muted)] block truncate">
                            {lang === 'ar' ? item.descAr : item.descEn}
                          </span>
                        </div>
                      </div>

                      <div
                        className={`w-10 h-6 rounded-full p-1 transition-colors shrink-0 flex items-center ${
                          isChecked ? 'bg-[var(--accent)] justify-end' : 'bg-slate-600 justify-start'
                        }`}
                      >
                        <div className="w-4 h-4 rounded-full bg-white shadow-md" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </Card>
      )}

      {/* CATEGORY 3: ACCOUNT & SUPPORT */}
      {activeCategory === 'account' && (
        <div className="space-y-4 animate-fade-in">
          <Card className="space-y-4 border-2 border-[var(--accent)]/30">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[var(--accent)]/15 text-[var(--accent)]">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[var(--text-primary)]">
                    {lang === 'ar' ? 'الملف الشخصي والربط' : 'User Profile & Integrations'}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {user.email ? user.email : lang === 'ar' ? 'حساب نشط' : 'Active Account'}
                  </p>
                </div>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => onNavigate('profile')}
                icon={<User className="w-4 h-4" />}
              >
                {lang === 'ar' ? 'إدارة الملف الشخصي' : 'Manage Profile'}
              </Button>
            </div>
          </Card>

          {/* Dedicated Return to Login Card */}
          <Card className="space-y-4 border-2 border-indigo-500/30 bg-indigo-500/5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-500">
                  <LogOut className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[var(--text-primary)]">
                    {lang === 'ar' ? 'العودة لصفحة تسجيل الدخول (تسجيل الخروج)' : 'Return to Login Page (Log Out)'}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    {lang === 'ar'
                      ? 'العودة المباشرة إلى واجهة تسجيل الدخول والإنشاء للتبديل بين الحسابات أو فتح حساب جديد.'
                      : 'Return directly to the login interface to switch accounts or sign in again.'}
                  </p>
                </div>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  triggerToast(lang === 'ar' ? 'جاري التحويل لصفحة تسجيل الدخول...' : 'Redirecting to login...');
                  setTimeout(() => {
                    onResetOnboarding();
                  }, 400);
                }}
                icon={<LogOut className="w-4 h-4" />}
                className="shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white font-black"
              >
                {lang === 'ar' ? 'العودة لتسجيل الدخول 🔑' : 'Go to Login 🔑'}
              </Button>
            </div>
          </Card>

          <Card className="space-y-4">
            <div className="border-b border-[var(--border-subtle)] pb-3">
              <h3 className="text-base font-extrabold text-[var(--text-primary)] flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[var(--accent)]" />
                {lang === 'ar' ? 'دليل الاستخدام والدعم' : 'Manual & Help Center'}
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                {lang === 'ar'
                  ? 'دليل تعليمي لمساعدتك في استخدام التطبيق والربط بالتوأم الرقمي'
                  : 'Complete reference manual for app usage and digital twin.'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                fullWidth
                variant="primary"
                onClick={() => onNavigate('help')}
                icon={<HelpCircle className="w-4 h-4" />}
              >
                {lang === 'ar' ? '📖 فتح دليل الاستخدام الشامل' : '📖 Open Full User Guide'}
              </Button>

              <Button
                fullWidth
                variant="outline"
                onClick={() => {
                  onResetOnboarding();
                  triggerToast(
                    lang === 'ar' ? 'جاري إعادة التهيئة...' : 'Restarting onboarding...'
                  );
                }}
                icon={<RotateCcw className="w-4 h-4" />}
              >
                {lang === 'ar' ? 'إعادة جولة التعرف (Onboarding)' : 'Restart Onboarding Flow'}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* CATEGORY 4: SECURITY & DATA BACKUP */}
      {activeCategory === 'security' && (
        <div className="space-y-4 animate-fade-in">
          {/* Production Readiness Status Card */}
          <Card className="space-y-4 border-2 border-emerald-500/40 bg-emerald-500/5">
            <div className="border-b border-[var(--border-subtle)] pb-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-black text-[var(--text-primary)] flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  {lang === 'ar' ? 'جاهزية النظام والبيانات الحقيقية للرفع (Production Status)' : 'Real Production & Data Readiness'}
                </h3>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  {lang === 'ar'
                    ? 'التطبيق يعمل ببيانات حقيقية مخزنة بشكل دائم، مع تعطيل الدخول الافتراضي وربط قاعدة البيانات الحية.'
                    : 'App runs with real user persistence, disk database storage, and disabled default guest access.'}
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-500 font-black text-xs shrink-0 flex items-center gap-1.5 border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                {lang === 'ar' ? 'جاهز للرفع 100%' : '100% Ready for Deployment'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-1">
                <span className="text-[11px] font-bold text-[var(--text-muted)] block">
                  {lang === 'ar' ? 'تخزين المستخدمين' : 'User Database'}
                </span>
                <span className="text-xs font-black text-emerald-500 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {lang === 'ar' ? 'قاعدة بيانات خادم حقيقية' : 'Persistent Disk DB'}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-1">
                <span className="text-[11px] font-bold text-[var(--text-muted)] block">
                  {lang === 'ar' ? 'وضع الدخول' : 'Access Mode'}
                </span>
                <span className="text-xs font-black text-emerald-500 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {lang === 'ar' ? 'مصادقة حقيقية (تم إغلاق الزائر)' : 'Strict Auth (Guest Disabled)'}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-1">
                <span className="text-[11px] font-bold text-[var(--text-muted)] block">
                  {lang === 'ar' ? 'التشفير والتزامن' : 'Encryption & Persistence'}
                </span>
                <span className="text-xs font-black text-emerald-500 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {lang === 'ar' ? 'AES-256 + LocalStorage' : 'AES-256 + LocalStorage'}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[var(--bg-hover)] border border-[var(--border-subtle)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-xs font-extrabold text-[var(--text-primary)] block">
                  {lang === 'ar' ? 'تصفير البيانات التوضيحية وتدشين حساب ناصع' : 'Clear Sample Demo Data'}
                </span>
                <p className="text-[11px] text-[var(--text-secondary)]">
                  {lang === 'ar'
                    ? 'مسح كافة المهام والشرائح التوضيحية للبدء بواجهة ناصعة 100% لإدخال بياناتك الحقيقية.'
                    : 'Clear all placeholder demo tasks and graph items to start clean.'}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  localStorage.removeItem('nexus_user_tasks_v2');
                  localStorage.removeItem('nexus_user_graph_nodes_v2');
                  triggerToast(lang === 'ar' ? 'تم مسح البيانات التوضيحية بنجاح للبدء بصفحة حقيقية ناصعة ✓' : 'Demo data cleared for clean real production start ✓');
                  setTimeout(() => window.location.reload(), 1200);
                }}
                className="shrink-0"
              >
                {lang === 'ar' ? 'تصفير البيانات للإنتاج' : 'Clear Demo Data'}
              </Button>
            </div>
          </Card>

          {/* JSON Backup & Export Center */}
          <Card className="space-y-4 border-2 border-indigo-500/30">
            <div className="border-b border-[var(--border-subtle)] pb-3">
              <h3 className="text-base font-extrabold text-[var(--text-primary)] flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-500" />
                {lang === 'ar' ? 'مركز إدارة وتنزيل تقارير النظام المنسقة (Executive Reports Center)' : 'Executive Reports & Data Center'}
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                {lang === 'ar'
                  ? 'تنزيل تقارير تنفيذية منسقة بوضوح ومكتوبة بلغة واضحة وسهلة القراءة بدلاً من الكود المباشر.'
                  : 'Download formatted executive reports presented in clear text and readable structure rather than raw code.'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                variant="primary"
                onClick={handleExportFormattedReport}
                icon={<Download className="w-4 h-4" />}
                className="w-full justify-center"
              >
                {lang === 'ar' ? 'تنزيل تقرير بيانات النظام المنسق (TXT)' : 'Download Formatted Report (TXT)'}
              </Button>

              <label className="w-full cursor-pointer">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportJSON}
                  className="hidden"
                />
                <div className="w-full px-4 py-2 rounded-xl border border-[var(--border-subtle)] hover:border-[var(--accent)] bg-[var(--bg-hover)] text-[var(--text-primary)] font-extrabold text-xs flex items-center justify-center gap-2 transition-all">
                  <Upload className="w-4 h-4 text-[var(--accent)]" />
                  <span>{lang === 'ar' ? 'استيراد نسخة احتياطية (JSON)' : 'Import JSON Backup'}</span>
                </div>
              </label>
            </div>
          </Card>

          <Card className="space-y-4 border-2 border-red-500/40 bg-red-500/5">
          <h3 className="text-base font-extrabold text-[var(--danger)] flex items-center gap-2 border-b border-[var(--border-subtle)] pb-3">
            <ShieldAlert className="w-5 h-5 text-[var(--danger)]" />
            {lang === 'ar' ? 'الأمان وإعادة الضبط' : 'Security & Reset Operations'}
          </h3>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[var(--bg-surface)] border border-red-500/20">
            <div className="space-y-1">
              <span className="text-sm font-black text-[var(--text-primary)] block">
                {lang === 'ar' ? `حذف حساب (${user.email || 'المستخدم'}) نهائياً` : `Delete Account (${user.email || 'User'})`}
              </span>
              <p className="text-xs text-[var(--text-secondary)]">
                {lang === 'ar'
                  ? 'سيتم إلغاء الحساب وحذف جميع البيانات المربوطة فوراً.'
                  : 'Permanently remove your account and associated local data.'}
              </p>
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setShowDeleteAccountConfirm(true)}
              icon={<AlertTriangle className="w-4 h-4" />}
              className="shrink-0"
            >
              {lang === 'ar' ? 'حذف الحساب نهائياً' : 'Delete Account'}
            </Button>
          </div>

          <div className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-sm font-black text-[var(--text-primary)] block">
                {lang === 'ar' ? 'إعادة ضبط المصنع (Factory Reset)' : 'Factory Reset'}
              </span>
              <p className="text-xs text-[var(--text-secondary)]">
                {lang === 'ar'
                  ? 'مسح كافة المخططات والتفضيلات والبيانات المخزنة محلياً.'
                  : 'Wipe all schemas, contexts, and user settings stored locally.'}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowResetConfirm(true)}
              icon={<RotateCcw className="w-4 h-4" />}
              className="shrink-0"
            >
              {lang === 'ar' ? 'مسح البيانات وإعادة الضبط' : 'Purge All Data & Reset'}
            </Button>
          </div>
        </Card>
      </div>
      )}

      {/* Delete Account Modal Confirmation */}
      {showDeleteAccountConfirm && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[var(--bg-surface)] border-2 border-red-500 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <h3 className="text-lg font-black text-[var(--danger)] flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-red-500" />
                {lang === 'ar' ? 'تأكيد حذف الحساب نهائياً' : 'Confirm Account Deletion'}
              </h3>
              <button
                onClick={() => setShowDeleteAccountConfirm(false)}
                className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-2xl text-xs space-y-1">
              <p className="font-bold text-[var(--danger)]">
                ⚠️ {lang === 'ar' ? 'تحذير هام:' : 'Critical Warning:'}
              </p>
              <p className="text-[var(--text-primary)]">
                {lang === 'ar'
                  ? `أنت على وشك حذف حسابك (${user.email || user.name}) بشكل نهائي.`
                  : `You are about to permanently delete account (${user.email || user.name}).`}
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setShowDeleteAccountConfirm(false)}>
                {lang === 'ar' ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={async () => {
                  setShowDeleteAccountConfirm(false);
                  triggerToast(
                    lang === 'ar' ? 'تم حذف الحساب نهائياً...' : 'Account deleted...'
                  );
                  await deleteAccount();
                  setTimeout(() => {
                    onResetOnboarding();
                  }, 800);
                }}
              >
                {lang === 'ar' ? 'تأكيد الحذف نهائياً' : 'Yes, Delete Account'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Factory Reset Modal Confirmation */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--bg-surface)] border-2 border-[var(--danger)]/50 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <h3 className="text-lg font-black text-[var(--danger)] flex items-center gap-2">
                <AlertTriangle className="w-6 h-6" />
                {lang === 'ar' ? 'تأكيد إعادة ضبط المصنع' : 'Confirm Factory Reset'}
              </h3>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              {lang === 'ar'
                ? 'هل أنت تأكد من أنك تريد مسح جميع البيانات المخزنة والتفضيلات محلياً؟'
                : 'Are you sure you want to erase all local settings and data?'}
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setShowResetConfirm(false)}>
                {lang === 'ar' ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button variant="danger" size="sm" onClick={handleFactoryReset}>
                {lang === 'ar' ? 'نعم، مسح وإعادة الضبط' : 'Yes, Purge & Reset'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


