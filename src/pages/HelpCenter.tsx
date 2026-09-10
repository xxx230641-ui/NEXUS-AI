import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import {
  HelpCircle,
  ChevronDown,
  Compass,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Network,
  Zap,
  ShieldAlert,
  Sparkles,
  AlertTriangle,
  Lightbulb,
  Target,
  Brain,
  Layers,
  ShieldCheck,
  Clock,
  Briefcase,
  Users,
  Heart,
  LayoutDashboard,
  Smartphone,
  Bell,
  Bot,
  UserCheck,
  PlusCircle,
  Cpu,
  Lock,
  Mic,
  Palette,
  Trash2,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useLang } from '../hooks/useLang';

export const HelpCenter: React.FC = () => {
  const { t } = useTranslation();
  const { isRTL, lang } = useLang();

  // Active Tab for Overview
  const [activeTab, setActiveTab] = useState<'overview' | 'how_it_works' | 'problems' | 'solutions' | 'faq'>('how_it_works');

  // Accordion state for FAQs
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Accordion state for How-It-Works feature guide
  const [openFeatureGuide, setOpenFeatureGuide] = useState<number | null>(0);

  // Interactive Tour Modal State
  const [isTourActive, setIsTourActive] = useState<boolean>(false);
  const [tourStep, setTourStep] = useState<number>(0);

  const tourSteps = [
    {
      title: '١. شريط التنقل الرئيسي',
      desc: 'يمكنك التبديل بين الشاشة الرئيسية، شبكة السياق التفاعلية، الإشعارات، وحسابك الشخصي.',
      target: 'Sidebar / BottomNav',
    },
    {
      title: '٢. السياق النشط ومؤشر الدقة',
      desc: 'يعرض السياق المستنتج حالياً (عمل، عائلة، دراسة) بناءً على موقعك واجتماعاتك الجارية.',
      target: 'Active Context Badge',
    },
    {
      title: '٣. التنبيهات والتضاربات السياقية',
      desc: 'ينبهك التطبيق فور اكتشاف مواعيد متضاربة أو ضغوط زمنية قبل وقوعها.',
      target: 'Context Conflicts',
    },
    {
      title: '٤. تبديل الثيم واللغة وحذف الحساب',
      desc: 'زر سريع بالإعدادات للتحكم بالثيم، الصور الشخصية، وحذف الحساب نهائياً عند الحاجة.',
      target: 'Settings & Delete Account',
    },
  ];

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const toggleFeatureGuide = (idx: number) => {
    setOpenFeatureGuide(openFeatureGuide === idx ? null : idx);
  };

  const faqItems = t('help.faq', { returnObjects: true }) as Array<{ q: string; a: string }>;

  // Detailed Feature Guides Data
  const featureGuides = [
    {
      id: 'dashboard',
      icon: <LayoutDashboard className="w-5 h-5 text-indigo-500" />,
      titleAr: '١. لوحة التحكم الرئيسية ومؤشر التركيز الفائق (Dashboard & Focus)',
      titleEn: '1. Dashboard & Super Focus Engine',
      summaryAr: 'شرح كيفية حساب مؤشر التركيز الفائق، تبديل السياق الحصري، وعرض الإحصائيات اللحظية.',
      summaryEn: 'How Super Focus score is calculated, instant context switching, and real-time stats.',
      stepsAr: [
        'يقوم المحرك المركزي بجمع بيانات التطبيقات المتصلة والمواعيد المسجلة ويحسب "مؤشر التركيز الفائق" (مثل 85%).',
        'يمكنك استخدام زر "مبدل السياق" (Context Switcher) لتصفية الواجهة فوراً إلى سياق محدد (مهني، عائلي، دراسي، اجتماعي).',
        'تعرض اللوحة ملخص التطبيقات المتصلة، العقد النشطة في خريطة السياق، والتنبؤات المباشرة ليومك.',
      ],
      stepsEn: [
        'The central engine aggregates data from connected apps and schedules to calculate a Focus Index (e.g., 85%).',
        'Use the Context Switcher button to instantly filter the entire interface by context (Work, Family, Learning, Social).',
        'Displays connected phone apps, active graph nodes, and live daily schedule predictions.',
      ],
    },
    {
      id: 'graph',
      icon: <Network className="w-5 h-5 text-purple-500" />,
      titleAr: '٢. شبكة السياق التفاعلية وتصور العلاقات (Interactive Context Graph)',
      titleEn: '2. Interactive Context Graph & Nodes',
      summaryAr: 'كيفية عمل شبكة العلاقات، إضافة عُقد جديدة، تحديد الأولوية، وتشفير AES-256.',
      summaryEn: 'How relational graph nodes work, adding new entities, priority levels, and encryption.',
      stepsAr: [
        'تعرض الصفحة خريطة تفاعلية ترسم "العُقد" (Nodes) والعلاقات التي تربط بين التطبيقات والكيانات والمواعيد والمهام.',
        'اضغط على زر "إضافة عنصر جديد" لإدخال كيان جديد (تطبيق، اجتماع، مهام، جهة اتصال)، وحدد أسبقيته (عالية، متوسطة، منخفضة).',
        'كل عقدة ترتبط تلقائياً بالسياق التابع لها، وتخضع لتشفير AES-256 السيادي لحماية معلوماتك.',
      ],
      stepsEn: [
        'An interactive canvas maps "Nodes" and relationships connecting apps, entities, events, tasks, and contacts.',
        'Click "Add New Node" to insert a new entity, assign priority levels (High, Medium, Low) and its assigned context.',
        'All nodes are linked to relevant contexts and protected by AES-256 Zero-Knowledge encryption.',
      ],
    },
    {
      id: 'integrations',
      icon: <Smartphone className="w-5 h-5 text-emerald-500" />,
      titleAr: '٣. تطبيقات الهاتف والتكاملات المحمية (Phone Apps & Sync)',
      titleEn: '3. Connected Phone Apps & Data Sync',
      summaryAr: 'طريقة ربط الواتساب، التليجرام، البريد، التقويم، سلاك، والموقع الجغرافي بكل سهولة.',
      summaryEn: 'Connecting WhatsApp, Telegram, Gmail, Calendar, Slack, GPS, and health metrics.',
      stepsAr: [
        'يدعم التطبيق ربط أكثر من ١٦ تطبيقا ونظاما بداخل هاتفك (واتساب، تليجرام، بريد جي ميل، تقويم جوجل، سلاك، نوشن، مكالمات، SMS، GPS، Apple Health).',
        'يمكنك تفعيل أو إيقاف المزامنة لأي تطبيق بضغطة زر واحدة (Toggle Switch) فوراً لضمان التحكم التام في خصوصيتك.',
        'تُحدث حالة المزامنة تلقائياً من "متصل" إلى "غير متصل" مع إتاحة زر "تحديث المزامنة الآن".',
      ],
      stepsEn: [
        'Supports 16+ phone apps and OS tools (WhatsApp, Telegram, Gmail, Google Calendar, Slack, Notion, Calls, SMS, GPS, Health).',
        'Enable or disable sync for any app instantly with a 1-click toggle switch for complete privacy control.',
        'Sync statuses update dynamically with a manual "Sync Now" trigger.',
      ],
    },
    {
      id: 'notifications',
      icon: <Bell className="w-5 h-5 text-amber-500" />,
      titleAr: '٤. مركز التنبؤ الذكي وحل التضارب بضغطة زر (Conflict Resolver)',
      titleEn: '4. Smart Conflict Resolver & Notifications',
      summaryAr: 'كيف يكتشف النظام تضارب المواعيد مسبقاً ويكتشف الحل التلقائي المباشر.',
      summaryEn: 'How early overlap conflict detection works with 1-click auto rescheduling.',
      stepsAr: [
        'يقوم المحرك الذكي بتحليل كافة المواعيد في تقويمك والرسائل الواردة لتقييم وجود تضارب زمكاني.',
        'عند اكتشاف تعارض (مثل اجتماع عمل يتزامن مع موعد شخصي)، يصدر التطبيق تنبيهاً حرجاً باللون الأحمر.',
        'يتوفر زر "إعادة الجدولة الآلية" (1-Click Auto Reschedule) والذي يقوم تلقائياً ببدائل زمنية وإعادة تنظيم التقويم.',
      ],
      stepsEn: [
        'AI algorithms analyze your calendar and incoming messages to flag spatiotemporal overlaps in advance.',
        'When a conflict is detected (e.g. work meeting overlapping a personal doctor visit), a critical alert appears.',
        'Click "Auto Reschedule" to trigger instant AI time adjustments and resolve overlapping slots.',
      ],
    },
    {
      id: 'ai_twin',
      icon: <Bot className="w-5 h-5 text-cyan-500" />,
      titleAr: '٥. المساعد الصوتي والتوأم الرقمي بصلحياته الكاملة (Voice Executive Twin)',
      titleEn: '5. Executive Voice Assistant & Digital Twin',
      summaryAr: 'طريقة استخدام المساعد الصوتي باللغة العربية وإصدار أوامر تنفذية سريعة في التطبيق.',
      summaryEn: 'Issuing Arabic/English voice commands to execute real app actions and theme shifts.',
      stepsAr: [
        'يعتمد المساعد على نموذج الذكاء الاصطناعي NEXUS AI Flash مع صلاحيات تنفيذية كاملة للتحكم في واجهة التطبيق.',
        'تحدث بصوتك أو اكتب له أمراً مثل: "غير الوضع إلى الليلي"، "غير اللون إلى الزمرّدي"، "افتـح الإعدادات"، "أضف مهمة جديدة"، "بدل إلى السياق العائلي".',
        'يقوم المساعد بتنفيذ الأمر الإداري المباشر في النظام ويعرض لك تقرير الأوامر المنفذة فوراً.',
      ],
      stepsEn: [
        'Powered by NEXUS AI Flash with full administrative privileges to execute direct UI actions.',
        'Speak or type commands like: "Switch to dark mode", "Change accent to Emerald", "Open Settings", "Add task", "Switch context".',
        'Executes the system command immediately and returns a formatted executive report.',
      ],
    },
    {
      id: 'profile_settings',
      icon: <UserCheck className="w-5 h-5 text-rose-500" />,
      titleAr: '٦. إدارة الحساب، الثيمات وحذف البيانات نهائياً (Profile & Data Erasure)',
      titleEn: '6. Account Management, Themes & Data Wipe',
      summaryAr: 'التسجيل مع Google، اختيار الألوان، وخيار المسح النهائي الشامل للبيانات.',
      summaryEn: 'Google auth, custom accent color themes, and permanent account wipe.',
      stepsAr: [
        'يدعم التطبيق التسجيل التلقائي عبر حساب Google الحقيقي أو إدخال البريد واسم المستخدم يدويًا.',
        'يمكنك اختيار صورتك الشخصية وتغيير اللون الرئيسي للواجهة بين ٦ ألوان جذابة (النيلي، الزمردي، البنفسجي، العنبري، الوردي، السماوي).',
        'في صفحة الإعدادات، يتيح التطبيق زر "حذف الحساب نهائياً ومسح البيانات" لتنفيذ مسح كامل لكافة السجلات بدون رجعة لحماية خصوصيتك.',
      ],
      stepsEn: [
        'Sign in seamlessly with Google OAuth or enter your username and email manually.',
        'Customize your avatar and select from 6 accent colors (Indigo, Emerald, Violet, Amber, Rose, Cyan) in light/dark themes.',
        'In Settings, execute permanent account deletion to wipe all stored records cleanly.',
      ],
    },
  ];

  return (
    <div className="space-y-8 pb-12 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] flex items-center gap-2.5">
            <HelpCircle className="w-8 h-8 text-[var(--accent)]" />
            {t('help.title')}
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            {lang === 'ar'
              ? 'دليلك الشامل لمعرفة ماهية Nexus AI، كيفية عمل كل جزء في التطبيق، والمشاكل والحلول المتاحة'
              : 'Your complete guide to Nexus AI: How every feature works, purpose, problems solved, and interactive walkthroughs'}
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsTourActive(true)}
          icon={<Compass className="w-4 h-4 text-[var(--accent)]" />}
          className="shrink-0"
        >
          {t('help.tourTitle')}
        </Button>
      </div>

      {/* QUICK NAVIGATION TABS */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-[var(--bg-hover)] border border-[var(--border-subtle)]">
        {[
          {
            id: 'how_it_works',
            labelAr: '⚙️ طريقة عمل كل ميزة في التطبيق',
            labelEn: '⚙️ How Every Feature Works',
            icon: Cpu,
          },
          {
            id: 'overview',
            labelAr: '💡 ما هو التطبيق وليش تم صنعه؟',
            labelEn: '💡 What is Nexus AI & Purpose',
            icon: Sparkles,
          },
          {
            id: 'problems',
            labelAr: '⚠️ المشاكل التي نعاني منها',
            labelEn: '⚠️ Pain Points & Problems',
            icon: AlertTriangle,
          },
          {
            id: 'solutions',
            labelAr: '✨ الحلول المبتكرة التي يقدمها',
            labelEn: '✨ Solutions Offered',
            icon: Lightbulb,
          },
          {
            id: 'faq',
            labelAr: '❓ الأسئلة الشائعة والأركان',
            labelEn: '❓ FAQs & Pillars',
            icon: HelpCircle,
          },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`
                flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer touch-manipulation
                ${
                  isActive
                    ? 'bg-[var(--accent)] text-white shadow-md scale-102'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]'
                }
              `}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{lang === 'ar' ? tab.labelAr : tab.labelEn}</span>
            </button>
          );
        })}
      </div>

      {/* SECTION 0: DETAILED "HOW EVERYTHING WORKS" GUIDE (طريقة عمل كل نقطة وميزة بالتفصيل) */}
      {(activeTab === 'how_it_works' || activeTab === 'overview') && (
        <Card className="space-y-6 border-2 border-[var(--accent)]/40 bg-[var(--bg-surface)]">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-[var(--accent)]/15 text-[var(--accent)] font-black">
                <Cpu className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-black text-[var(--accent)] uppercase tracking-wider">
                  {lang === 'ar' ? 'الدليل التشغيلي الشامل لكل نقطة' : 'Complete Functional Manual'}
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)]">
                  {lang === 'ar' ? 'كيف يعمل كل عنصر وميزة في تطبيق Nexus AI؟' : 'How Every Feature Works in Nexus AI'}
                </h2>
              </div>
            </div>
            <span className="text-xs font-black px-3 py-1 rounded-full bg-[var(--accent)] text-white shrink-0">
              {lang === 'ar' ? '٦ أجزاء رئيسية' : '6 Core Modules'}
            </span>
          </div>

          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            {lang === 'ar'
              ? 'اضغط على أي جزء أدناه لاستكشاف الخطوات التفصيلية وكيفية عمل النظام التلقائي والذكاء الاصطناعي خلف الكواليس:'
              : 'Click any section below to expand step-by-step technical and functional details for each component:'}
          </p>

          <div className="space-y-3">
            {featureGuides.map((guide, idx) => {
              const isOpen = openFeatureGuide === idx;
              return (
                <div
                  key={guide.id}
                  className={`
                    rounded-2xl border transition-all overflow-hidden
                    ${
                      isOpen
                        ? 'border-[var(--accent)] bg-[var(--bg-surface)] shadow-lg'
                        : 'border-[var(--border-subtle)] bg-[var(--bg-base)] hover:border-[var(--accent)]/50'
                    }
                  `}
                >
                  {/* Header Button */}
                  <button
                    onClick={() => toggleFeatureGuide(idx)}
                    className="w-full flex items-center justify-between p-4 text-right cursor-pointer hover:bg-[var(--bg-hover)] transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded-xl bg-[var(--bg-hover)] border border-[var(--border-subtle)] shrink-0">
                        {guide.icon}
                      </div>
                      <div className="min-w-0 text-right">
                        <h3 className="text-sm sm:text-base font-extrabold text-[var(--text-primary)] truncate">
                          {lang === 'ar' ? guide.titleAr : guide.titleEn}
                        </h3>
                        <p className="text-xs text-[var(--text-muted)] truncate mt-0.5">
                          {lang === 'ar' ? guide.summaryAr : guide.summaryEn}
                        </p>
                      </div>
                    </div>

                    <ChevronDown
                      className={`w-5 h-5 text-[var(--text-muted)] shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-[var(--accent)]' : ''
                      }`}
                    />
                  </button>

                  {/* Body Content */}
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-5 pb-5 pt-2 border-t border-[var(--border-subtle)]/60 bg-[var(--bg-hover)]/30 space-y-3"
                      >
                        <h4 className="text-xs font-black text-[var(--accent)] uppercase tracking-wider">
                          {lang === 'ar' ? 'خطوات التشغيل وطريقة العمل:' : 'Operational Steps & Logic:'}
                        </h4>

                        <div className="space-y-2">
                          {(lang === 'ar' ? guide.stepsAr : guide.stepsEn).map((step, stepIdx) => (
                            <div
                              key={stepIdx}
                              className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-start gap-3 text-xs text-[var(--text-secondary)] leading-relaxed"
                            >
                              <span className="w-5 h-5 rounded-full bg-[var(--accent)]/15 text-[var(--accent)] font-extrabold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                                {stepIdx + 1}
                              </span>
                              <p className="flex-1">{step}</p>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* SECTION 1: OVERVIEW & PURPOSE (ما هو التطبيق وليش تم صنعه) */}
      {(activeTab === 'overview' || activeTab === 'faq') && (
        <Card className="space-y-6 border-2 border-[var(--accent)]/30 bg-[var(--bg-surface)]">
          <div className="flex items-center gap-3 border-b border-[var(--border-subtle)] pb-4">
            <div className="p-3 rounded-2xl bg-[var(--accent)]/15 text-[var(--accent)] font-black">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-black text-[var(--accent)] uppercase tracking-wider">
                {lang === 'ar' ? 'الرؤية والهدف والماهية' : 'Vision, Mission & Purpose'}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)]">
                {lang === 'ar' ? 'ما هو تطبيق Nexus AI وليش تم صنعه؟' : 'What is Nexus AI & Why Was It Built?'}
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 leading-relaxed">
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[var(--bg-base)] border border-[var(--border-subtle)] space-y-2">
                <h3 className="text-base font-extrabold text-[var(--text-primary)] flex items-center gap-2">
                  <Target className="w-5 h-5 text-[var(--accent)]" />
                  {lang === 'ar' ? 'تعريف التطبيق (Nexus AI)' : 'What is Nexus AI?'}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {lang === 'ar'
                    ? 'تطبيق Nexus AI هو نظام "التوأم الرقمي والمساعد التنفيذي الذكي" (Executive Digital Twin). تم تصميمه ليكون العقل المركز المحمي الذي يربط كافة تطبيقاتك (الواتساب، التقويم، البريد، سلاك، الملاحظات) ويحلل سياقات حياتك المختلفة تلقائياً.'
                    : 'Nexus AI is a Supreme Executive Digital Twin & Context Engine designed to connect all your daily apps (WhatsApp, Calendar, Email, Slack, Notes) and automatically manage your life contexts.'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--bg-base)] border border-[var(--border-subtle)] space-y-2">
                <h3 className="text-base font-extrabold text-[var(--text-primary)] flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  {lang === 'ar' ? 'لماذا تم صنع التطبيق؟' : 'Why was Nexus AI created?'}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {lang === 'ar'
                    ? 'تم ابتكار Nexus AI لإلغاء التشتت الرقمي المجهد. في عصرنا الحالي، يضيع الإنسان مئات الساعات في فتح عشرات التطبيقات، ومتابعة الرسائل وتفادي التضارب يدويًا. هدف التطبيق هو إعادة وقتك وتركيزك الذهني إليك عبر ذكاء اصطناعي سيادي يفهم أولوياتك ويحميك من التشتت.'
                    : 'Created to eliminate digital fatigue. Humans lose hundreds of hours switching between apps and managing schedules manually. Nexus AI restores your focus through a private context engine.'}
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[var(--accent)]/10 border border-[var(--accent)]/30 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <h4 className="text-sm font-black text-[var(--accent)] uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  {lang === 'ar' ? 'السياقات الخمسة التي يديرها Nexus AI' : '5 Managed Life Contexts'}
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2.5 p-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                    <Briefcase className="w-4 h-4 text-blue-500 shrink-0" />
                    <div>
                      <span className="font-extrabold text-[var(--text-primary)]">{lang === 'ar' ? 'السياق المهني:' : 'Professional:'}</span>{' '}
                      <span className="text-[var(--text-muted)]">{lang === 'ar' ? 'إدارة مشاريع العمل واجتماعات التقويم وتنبيهات سلاك' : 'Work projects, calendar meetings & Slack alerts'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 p-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                    <Users className="w-4 h-4 text-pink-500 shrink-0" />
                    <div>
                      <span className="font-extrabold text-[var(--text-primary)]">{lang === 'ar' ? 'السياق العائلي:' : 'Family:'}</span>{' '}
                      <span className="text-[var(--text-muted)]">{lang === 'ar' ? 'التزامات الأسرة، التسوق، ومواعيد الأبناء' : 'Family obligations, shopping & kids schedules'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 p-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                    <Heart className="w-4 h-4 text-red-500 shrink-0" />
                    <div>
                      <span className="font-extrabold text-[var(--text-primary)]">{lang === 'ar' ? 'السياق الشخصي:' : 'Personal:'}</span>{' '}
                      <span className="text-[var(--text-muted)]">{lang === 'ar' ? 'الأهداف الشخصية، اللياقة البدنية، والقراءة' : 'Personal goals, fitness, habits & reading'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--accent)]/40 text-[11px] font-bold text-[var(--text-secondary)] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>
                  {lang === 'ar'
                    ? 'تشفير كامل AES-256 وسيادة تامة بدون مشاركة بياناتك الشخصية مع أي طرف ثالث'
                    : 'AES-256 Zero-Knowledge Encryption protecting your digital footprint'}
                </span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* SECTION 2: PROBLEMS FACED BY PEOPLE (المشاكل التي يعاني منها الناس) */}
      {(activeTab === 'problems' || activeTab === 'overview') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-[var(--text-primary)] flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-amber-500" />
              {lang === 'ar' ? 'المشاكل الشائعة التي يعاني منها الناس يومياً' : 'Daily Digital Problems & Pain Points'}
            </h2>
            <span className="text-xs font-bold text-[var(--text-muted)]">
              {lang === 'ar' ? '٤ تحديات رئيسية' : '4 Core Challenges'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="space-y-2 border-l-4 border-amber-500 hoverable">
              <div className="flex items-center gap-2 text-amber-500 font-extrabold text-sm">
                <Clock className="w-4 h-4" />
                <h3>{lang === 'ar' ? '١. تشتت الإشعارات وتعدد التطبيقات' : '1. App Fatigue & Notification Chaos'}</h3>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {lang === 'ar'
                  ? 'يعاني المستخدم من التبديل المستمر بين أكثر من ١٠ تطبيقات (واتساب، تقويم، بريد، سلاك، ملاحظات)، مما يسبب فقدان الرسائل المهمة وإهدار أكثر من ساعتين يومياً في المتابعة اليدوية.'
                  : 'Constant switching across 10+ separate apps causes lost messages and hours spent on manual updates daily.'}
              </p>
            </Card>

            <Card className="space-y-2 border-l-4 border-red-500 hoverable">
              <div className="flex items-center gap-2 text-red-500 font-extrabold text-sm">
                <AlertTriangle className="w-4 h-4" />
                <h3>{lang === 'ar' ? '٢. تضارب المواعيد والالتزامات المفاجئة' : '2. Unexpected Schedule Conflicts'}</h3>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {lang === 'ar'
                  ? 'حضور اجتماعات عمل مفاجئة تتضارب مع مواعيد طبيبة أو التزامات عائلية حاسمة دون وجود نظام ينبه المستخدم مسبقاً قبل وقوع المشكلة.'
                  : 'Overlapping work meetings with family or health commitments without early warnings.'}
              </p>
            </Card>

            <Card className="space-y-2 border-l-4 border-indigo-500 hoverable">
              <div className="flex items-center gap-2 text-indigo-500 font-extrabold text-sm">
                <Brain className="w-4 h-4" />
                <h3>{lang === 'ar' ? '٣. الإرهاق الذهني والنسيان' : '3. Cognitive Overload & Context Switching'}</h3>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {lang === 'ar'
                  ? 'محاولة تذكر كافة المهام والتفاصيل بين الحياة الشخصية والمهنية تخلق إرهاقاً ذهنياً وتسبب نسيان القرارات والمهام العاجلة.'
                  : 'Juggling all details mentally creates brain fog, stress, and forgotten commitments.'}
              </p>
            </Card>

            <Card className="space-y-2 border-l-4 border-purple-500 hoverable">
              <div className="flex items-center gap-2 text-purple-500 font-extrabold text-sm">
                <ShieldAlert className="w-4 h-4" />
                <h3>{lang === 'ar' ? '٤. المخاوف على الخصوصية وتسريب البيانات' : '4. Privacy Risks in Public AI'}</h3>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {lang === 'ar'
                  ? 'الخوف من استخدام أدوات الذكاء الاصطناعي التي تقوم بتخزين البيانات بشكل غير آمن أو تسريب معلومات العمل والأسرار العائلية.'
                  : 'Concerns over unencrypted public AI models misusing sensitive personal or corporate data.'}
              </p>
            </Card>
          </div>
        </div>
      )}

      {/* SECTION 3: SOLUTIONS DELIVERED BY NEXUS AI (الحلول التي قدمها التطبيق) */}
      {(activeTab === 'solutions' || activeTab === 'overview') && (
        <Card className="space-y-5 border-2 border-emerald-500/30 bg-emerald-500/5">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-500 font-black">
                <Lightbulb className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-black text-[var(--text-primary)]">
                {lang === 'ar' ? 'الحلول المبتكرة التي قدمها تطبيق Nexus AI' : 'Solutions Delivered by Nexus AI'}
              </h2>
            </div>
            <span className="text-xs font-black text-emerald-500 px-2.5 py-1 rounded-full bg-emerald-500/10">
              {lang === 'ar' ? 'حلول ذكية حاسمة' : '4 Smart Solutions'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-2">
              <div className="flex items-center gap-2 text-emerald-500 font-extrabold text-sm">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <h4>{lang === 'ar' ? '١. شبكة المزامنة الموحدة (Context Graph)' : '1. Unified Context Graph'}</h4>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {lang === 'ar' ? 'الحل:' : 'Solution:'}{' '}
                {lang === 'ar'
                  ? 'ربط تلقائي لكافة التطبيقات في لوحة تحكم واحدة تفهم علاقة الرسائل بالمواعيد والمهام وتغنيك عن التنقل بين التطبيقات.'
                  : 'Connects all phone apps into a single graph mapping messages to tasks and schedule.'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-2">
              <div className="flex items-center gap-2 text-emerald-500 font-extrabold text-sm">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <h4>{lang === 'ar' ? '٢. التنبؤ المبكر وحل التضارب الذكي' : '2. Predictive Conflict Resolution'}</h4>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {lang === 'ar' ? 'الحل:' : 'Solution:'}{' '}
                {lang === 'ar'
                  ? 'محرك تنبؤ يحلل جدولك مسبقاً وينبهك بوجود تعارض زمكاني مع اقتراح حلول فورية وإعادة جدولته بضغطة زر.'
                  : 'Detects overlapping meetings or travel constraints early and offers 1-click automated rescheduling.'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-2">
              <div className="flex items-center gap-2 text-emerald-500 font-extrabold text-sm">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <h4>{lang === 'ar' ? '٣. محرك التبديل الآلي للسياق (Smart Context Engine)' : '3. Automated Context Engine'}</h4>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {lang === 'ar' ? 'الحل:' : 'Solution:'}{' '}
                {lang === 'ar'
                  ? 'يغير التطبيق واجهته وإشعاراته تلقائياً حسب مكانك وزمنك (وضع العمل أثناء الدوام، الوضع العائلي بالمنزل).'
                  : 'Dynamically filters UI, focus mode, and notifications depending on your active context.'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-2">
              <div className="flex items-center gap-2 text-emerald-500 font-extrabold text-sm">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <h4>{lang === 'ar' ? '٤. الخصوصية السيادية ومسح البيانات التام' : '4. Zero-Knowledge Sovereignty'}</h4>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {lang === 'ar' ? 'الحل:' : 'Solution:'}{' '}
                {lang === 'ar'
                  ? 'تشفير عالي الأمان وحرية كاملة للمستخدم في تصدير بياناته أو حذف الحساب والمسح النهائي للبيانات في أي لحظة.'
                  : 'Total data sovereignty with end-to-end encryption and instant permanent account deletion options.'}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* SECTION 4: CORE ARCHITECTURAL PILLARS */}
      {(activeTab === 'faq' || activeTab === 'overview') && (
        <div className="space-y-3 pt-2">
          <h3 className="text-lg font-black text-[var(--text-primary)]">
            {lang === 'ar' ? 'الأركان الأساسية للنظام' : 'Core Platform Pillars'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="hoverable space-y-3 border-t-4 border-[var(--accent)]">
              <div className="p-3 w-fit rounded-xl bg-indigo-500/15 text-indigo-500">
                <Network className="w-6 h-6" />
              </div>
              <h4 className="text-base font-extrabold text-[var(--text-primary)]">
                {t('help.cards.graphTitle')}
              </h4>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {t('help.cards.graphDesc')}
              </p>
            </Card>

            <Card className="hoverable space-y-3 border-t-4 border-[var(--warning)]">
              <div className="p-3 w-fit rounded-xl bg-amber-500/15 text-amber-500">
                <Zap className="w-6 h-6" />
              </div>
              <h4 className="text-base font-extrabold text-[var(--text-primary)]">
                {t('help.cards.predictionsTitle')}
              </h4>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {t('help.cards.predictionsDesc')}
              </p>
            </Card>

            <Card className="hoverable space-y-3 border-t-4 border-[var(--danger)]">
              <div className="p-3 w-fit rounded-xl bg-red-500/15 text-red-500">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h4 className="text-base font-extrabold text-[var(--text-primary)]">
                {lang === 'ar' ? 'حذف الحساب والخصوصية' : 'Account Deletion & Privacy'}
              </h4>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {lang === 'ar'
                  ? 'يمكنك التوجه لصفحة الإعدادات لحذف الحساب نهائياً ومسح جميع البيانات والجلسات المخزنة بأمان.'
                  : 'Navigate to Settings to permanently delete your account and wipe all stored data cleanly.'}
              </p>
            </Card>
          </div>
        </div>
      )}

      {/* FAQs Accordion */}
      {(activeTab === 'faq' || activeTab === 'overview') && (
        <Card className="space-y-4">
          <h3 className="text-lg font-black text-[var(--text-primary)] border-b border-[var(--border-subtle)] pb-3">
            {t('help.faqTitle')}
          </h3>

          <div className="space-y-2">
            {Array.isArray(faqItems) &&
              faqItems.map((item, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={idx}
                    className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-hover)] overflow-hidden transition-all"
                  >
                    <button
                      onClick={() => toggleFaq(idx)}
                      className="w-full flex items-center justify-between p-4 text-right text-sm font-bold text-[var(--text-primary)] cursor-pointer hover:bg-[var(--border-subtle)]/50"
                    >
                      <span>{item.q}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-[var(--text-muted)] transition-transform duration-200 ${
                          isOpen ? 'rotate-180 text-[var(--accent)]' : ''
                        }`}
                      />
                    </button>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="px-4 pb-4 pt-1 text-xs text-[var(--text-secondary)] leading-relaxed border-t border-[var(--border-subtle)]/40"
                        >
                          {item.a}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
          </div>
        </Card>
      )}

      {/* Interactive Walkthrough Tour Modal */}
      {isTourActive && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <Card className="w-full max-w-lg space-y-5 bg-[var(--bg-elevated)] border-2 border-[var(--accent)] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-[var(--accent)]" />
                <h4 className="font-extrabold text-base text-[var(--text-primary)]">
                  {t('help.tourTitle')}
                </h4>
              </div>
              <span className="text-xs font-bold text-[var(--text-muted)] font-mono">
                {tourStep + 1} / {tourSteps.length}
              </span>
            </div>

            <div className="space-y-2 py-2">
              <h5 className="text-lg font-black text-[var(--accent)]">
                {tourSteps[tourStep].title}
              </h5>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                {tourSteps[tourStep].desc}
              </p>
              <div className="p-2.5 rounded-xl bg-[var(--bg-hover)] text-xs font-semibold text-[var(--text-muted)] mt-2">
                {lang === 'ar' ? 'العنصر المستهدف:' : 'Target Component:'} {tourSteps[tourStep].target}
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-3 border-t border-[var(--border-subtle)]">
              <Button
                variant="ghost"
                size="sm"
                disabled={tourStep === 0}
                onClick={() => setTourStep(tourStep - 1)}
              >
                {t('actions.back')}
              </Button>

              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => setIsTourActive(false)}>
                  {lang === 'ar' ? 'إغلاق' : 'Close'}
                </Button>
                {tourStep < tourSteps.length - 1 ? (
                  <Button
                    size="sm"
                    onClick={() => setTourStep(tourStep + 1)}
                    icon={isRTL ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                  >
                    {t('actions.next')}
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => setIsTourActive(false)}
                    icon={<CheckCircle className="w-4 h-4" />}
                  >
                    {lang === 'ar' ? 'إنهاء الجولة' : 'Finish Tour'}
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

