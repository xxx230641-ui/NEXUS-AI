import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import {
  AlertTriangle,
  Zap,
  CheckSquare,
  VolumeX,
  Volume2,
  Clock,
  ArrowUpRight,
  Sparkles,
  CheckCircle2,
  Calendar,
  Layers,
  Plus,
  Trash2,
  RefreshCw,
  Activity,
  SlidersHorizontal,
  Bot,
  PieChart,
  ShieldCheck,
  X,
  Check,
  Send,
  FileText,
  Workflow,
  Radio,
  ExternalLink,
  Play,
  Pause,
  RotateCcw,
  Target,
  Battery,
  Brain,
  Filter,
  Wand2,
  MessageSquare,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ContextBadge, ContextType } from '../components/ui/ContextBadge';
import { DailyReportModal } from '../components/ui/DailyReportModal';
import { DualCalendarWidget } from '../components/ui/DualCalendarWidget';
import { MeetingSummarizerModal } from '../components/ui/MeetingSummarizerModal';
import { useLang } from '../hooks/useLang';
import { useNotifications } from '../hooks/useNotifications';

interface DashboardProps {
  onNavigate: (page: string) => void;
  activeContext?: ContextType;
  onContextChange?: (context: ContextType) => void;
  onOpenAIModal?: () => void;
}

interface TimelineSlot {
  id: string;
  timeAr: string;
  timeEn: string;
  titleAr: string;
  titleEn: string;
  context: ContextType;
  predictedScore: number;
  aiNoteAr: string;
  aiNoteEn: string;
}

const TIMELINE_SLOTS: TimelineSlot[] = [
  {
    id: 't-morning',
    timeAr: '٠٩:٠٠ ص',
    timeEn: '09:00 AM',
    titleAr: 'سبرينت العمل والتطوير (Sprint Sync)',
    titleEn: 'Work Sprint Sync & Dev Team',
    context: 'professional',
    predictedScore: 96,
    aiNoteAr: 'مزامنة حية مع Slack وGoogle Calendar. وضع التركيز مفعّل تلقائياً.',
    aiNoteEn: 'Live sync with Slack & Calendar. Automatic focus filter active.',
  },
  {
    id: 't-afternoon',
    timeAr: '٠١:٠٠ م',
    timeEn: '01:00 PM',
    titleAr: 'جلسة التعلّم والتطوير الذاتي',
    titleEn: 'Deep Learning & AI Study Session',
    context: 'learning',
    predictedScore: 88,
    aiNoteAr: 'قراءة المراجع المخصصة ومتابعة مستجدات النماذج العصبية.',
    aiNoteEn: 'Review course material and follow up on neural model updates.',
  },
  {
    id: 't-evening',
    timeAr: '٠٦:٠٠ م',
    timeEn: '06:00 PM',
    titleAr: 'العشاء العائلي والتسوق العائلي',
    titleEn: 'Family Dinner & Grocery Run',
    context: 'family',
    predictedScore: 94,
    aiNoteAr: 'كتم إشعارات المهام العملية وإبراز مواعيد طبيب الأسنان والمشتريات.',
    aiNoteEn: 'Mute work alerts and surface family reminders & shopping lists.',
  },
  {
    id: 't-night',
    timeAr: '٠٩:٠٠ م',
    timeEn: '09:00 PM',
    titleAr: 'الأنشطة الشخصية والاسترخاء',
    titleEn: 'Personal Wellbeing & Reading',
    context: 'personal',
    predictedScore: 92,
    aiNoteAr: 'تزامن بيانات مؤشرات الصحة واللياقة، وإعداد الملخص التنفيذي للغد.',
    aiNoteEn: 'Sync HealthKit metrics and generate tomorrow\'s executive plan.',
  },
];

export const Dashboard: React.FC<DashboardProps> = ({
  onNavigate,
  activeContext: propContext,
  onContextChange,
  onOpenAIModal,
}) => {
  const { t } = useTranslation();
  const { lang } = useLang();
  const { addNotification } = useNotifications();
  const [internalContext, setInternalContext] = useState<ContextType>('professional');
  const activeContext = propContext || internalContext;

  const handleContextSelect = (ctx: ContextType) => {
    setInternalContext(ctx);
    if (onContextChange) {
      onContextChange(ctx);
    }
    const contextNamesAr: Record<string, string> = {
      family: 'العائلي 👨‍👩‍👧‍👦',
      professional: 'المهني 💼',
      personal: 'الشخصي 👤',
      social: 'الاجتماعي 🤝',
      learning: 'التعليمي 🎓',
    };
    triggerNotice(
      lang === 'ar'
        ? `تم التحويل بنجاح إلى السياق ${contextNamesAr[ctx] || ctx}`
        : `Switched context to ${ctx}`
    );

    // Dispatch real-time app status notification
    addNotification({
      titleAr: `تم تفعيل السياق ${contextNamesAr[ctx] || ctx}`,
      titleEn: `Context switched to ${ctx}`,
      descAr: `تم تحديث المخطط البياني وتكييف قواعد الفلترة والأولويات وفقاً للسياق الجديد.`,
      descEn: `Context graph updated and filtering rules adapted to ${ctx}.`,
      type: 'context',
      category: 'contextShifts',
      context: ctx,
    });
  };

  const [focusMode, setFocusMode] = useState<boolean>(true);
  const [conflictResolved, setConflictResolved] = useState<boolean>(false);
  const [isConflictModalOpen, setIsConflictModalOpen] = useState<boolean>(false);
  const [isMeetingSummarizerOpen, setIsMeetingSummarizerOpen] = useState<boolean>(false);
  const [isDailyReportOpen, setIsDailyReportOpen] = useState<boolean>(false);

  // Time Scenario Simulation State
  const [selectedTimelineId, setSelectedTimelineId] = useState<string>('t-morning');

  // AI Executive Brief Modal State
  const [isBriefModalOpen, setIsBriefModalOpen] = useState<boolean>(false);

  const [newTaskText, setNewTaskText] = useState<string>('');
  const [showAddTask, setShowAddTask] = useState<boolean>(false);
  const [isRefreshingBriefing, setIsRefreshingBriefing] = useState<boolean>(false);
  const [dashboardNotice, setDashboardNotice] = useState<string | null>(null);

  // Integrations live sync state
  const [isSyncingIntegrations, setIsSyncingIntegrations] = useState<boolean>(false);

  // Priority Tasks state (Persisted in LocalStorage per user session)
  const DEFAULT_DEMO_TASKS = [
    {
      id: 1,
      textAr: 'مراجعة خوارزمية التنبؤ بالسياق مع الفريق',
      textEn: 'Review context prediction algorithm with dev team',
      done: false,
      context: 'professional',
    },
    {
      id: 2,
      textAr: 'شراء المستلزمات العائلية قبل ميعاد ٦:٠٠ م',
      textEn: 'Buy family groceries before 6:00 PM dinner',
      done: false,
      context: 'family',
    },
    {
      id: 3,
      textAr: 'قراءة الفصل الثالث من كتاب التعلم العميق',
      textEn: 'Read Chapter 3 of Advanced Deep Learning book',
      done: true,
      context: 'learning',
    },
  ];

  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem('nexus_user_tasks_v2');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (err) {
      console.error('Failed to load tasks from local storage:', err);
    }
    return DEFAULT_DEMO_TASKS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('nexus_user_tasks_v2', JSON.stringify(tasks));
    } catch (err) {
      console.error('Failed to save tasks to local storage:', err);
    }
  }, [tasks]);

  const handleClearAllTasks = () => {
    setTasks([]);
    triggerNotice(lang === 'ar' ? 'تمت إزالة جميع المهام للبدء بقائمة ناصعة ونظيفة للإنتاج ✓' : 'All tasks cleared for clean production state ✓');
  };

  const handleRestoreDemoTasks = () => {
    setTasks(DEFAULT_DEMO_TASKS);
    triggerNotice(lang === 'ar' ? 'تمت استعادة المهام التوضيحية الافتراضية' : 'Demo sample tasks restored');
  };

  const triggerNotice = (msg: string) => {
    setDashboardNotice(msg);
    setTimeout(() => setDashboardNotice(null), 3200);
  };

  const toggleTask = (id: number) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  const deleteTask = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setTasks(tasks.filter((t) => t.id !== id));
    triggerNotice(lang === 'ar' ? 'تم حذف المهمة بنجاح' : 'Task removed');
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    const newTask = {
      id: Date.now(),
      textAr: newTaskText.trim(),
      textEn: newTaskText.trim(),
      done: false,
      context: activeContext,
    };
    setTasks([newTask, ...tasks]);
    setNewTaskText('');
    setShowAddTask(false);
    triggerNotice(lang === 'ar' ? 'تمت إضافة المهمة بنجاح' : 'New task added');
  };

  const handleRefreshBriefing = () => {
    setIsRefreshingBriefing(true);
    setTimeout(() => {
      setIsRefreshingBriefing(false);
      triggerNotice(
        lang === 'ar'
          ? 'تم تحديث الملخص التنبؤي وتحليل السياقات الحية'
          : 'Predictive briefing & live signals updated'
      );
    }, 1000);
  };

  const handleSyncIntegrations = () => {
    setIsSyncingIntegrations(true);
    setTimeout(() => {
      setIsSyncingIntegrations(false);
      triggerNotice(
        lang === 'ar'
          ? 'تمت إعادة مزامنة Google Calendar وSlack وNotion وHealthKit'
          : 'Successfully resynced Google Calendar, Slack, Notion, & HealthKit'
      );
    }, 1200);
  };

  const handleExecuteResolution = (methodTitle: string) => {
    setConflictResolved(true);
    setIsConflictModalOpen(false);
    triggerNotice(
      lang === 'ar'
        ? `تم حل التضارب بنجاح عبر إجراء: (${methodTitle})`
        : `Conflict resolved via: (${methodTitle})`
    );
  };

  const selectedSlot = TIMELINE_SLOTS.find((s) => s.id === selectedTimelineId) || TIMELINE_SLOTS[0];

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* Toast Notice */}
      <AnimatePresence>
        {dashboardNotice && (
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="p-3 bg-[var(--accent)] text-white rounded-2xl text-center text-xs sm:text-sm font-extrabold shadow-2xl flex items-center justify-center gap-2 border border-white/20 backdrop-blur-md"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            <span>{dashboardNotice}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Context Banner Header */}
      <Card className="relative overflow-hidden border-2 border-[var(--accent)] bg-[var(--bg-surface)]">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                {t('dashboard.activeContext')}:
              </span>
              <ContextBadge
                context={activeContext}
                size="lg"
                active
                score={94}
                onClick={() => {
                  const contexts: ContextType[] = ['professional', 'family', 'personal', 'social', 'learning'];
                  const currentIndex = contexts.indexOf(activeContext as ContextType);
                  const nextContext = contexts[(currentIndex + 1) % contexts.length];
                  handleContextSelect(nextContext);
                }}
              />
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
              {t('dashboard.title')}
            </h1>

            <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] font-medium">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
              <span>
                {t('dashboard.aiReasoning')}:{' '}
                {lang === 'ar'
                  ? 'استنتاج من الموقع الحالي والتزامات التقويم لـ 3 ساعات قادمة.'
                  : 'Inferred from your live location and calendar schedule for the next 3 hours.'}
              </span>
            </div>
          </div>

          {/* Fast Context Selector Pills */}
          <div className="flex flex-wrap gap-1.5 p-2 rounded-2xl bg-[var(--bg-base)] border border-[var(--border-subtle)] shadow-inner">
            {(['family', 'professional', 'personal', 'social', 'learning'] as ContextType[]).map((ctx) => (
              <ContextBadge
                key={ctx}
                context={ctx}
                size="sm"
                active={activeContext === ctx}
                onClick={() => handleContextSelect(ctx)}
              />
            ))}
          </div>
        </div>
      </Card>

      {/* Context Conflict Alert Banner */}
      {!conflictResolved && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, height: 0 }}
        >
          <Card className="border-2 border-[var(--danger)] bg-red-500/5 space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-[var(--danger)]/15 text-[var(--danger)] shrink-0">
                  <AlertTriangle className="w-6 h-6 animate-bounce" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-extrabold text-[var(--danger)] flex items-center gap-2">
                    <span>{t('dashboard.conflictAlert')}</span>
                    <span className="text-[10px] bg-red-500/20 text-red-500 px-2 py-0.5 rounded-full font-mono font-bold">
                      {lang === 'ar' ? 'تضارب عاجل' : 'Urgent Overlap'}
                    </span>
                  </h3>
                  <p className="text-xs text-[var(--text-primary)] leading-relaxed font-semibold">
                    {t('dashboard.conflictMessage')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => setIsConflictModalOpen(true)}
                  icon={<Workflow className="w-4 h-4" />}
                >
                  {t('actions.resolveConflict')}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setConflictResolved(true)}
                >
                  {t('actions.dismiss')}
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Interactive Dual Gregorian & Hijri Calendar Widget */}
      <DualCalendarWidget onOpenReport={() => setIsDailyReportOpen(true)} />

      {/* AI MEETING & INTERVIEW SUMMARIZER BANNER */}
      <Card className="border-2 border-indigo-500/30 bg-[var(--bg-surface)] p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-400 shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-[var(--text-primary)] flex items-center gap-2">
              <span>{lang === 'ar' ? '🎙️ تلخيص المقابلات واللقاءات بالذكاء الاصطناعي (Meeting Summarizer)' : '🎙️ AI Meeting & Interview Summarizer'}</span>
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 text-[10px] font-mono font-black">
                NEXUS AI
              </span>
            </h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              {lang === 'ar'
                ? 'خيار تلخيص محادثات زوم، وتيمز، وجوجل ميت وتوزيع المهام واستخراج القرارات بطلب وموافقة العميل.'
                : 'Convert Zoom, Teams & Google Meet transcripts into executive notes, action items & pulse ratings.'}
            </p>
          </div>
        </div>

        <Button
          onClick={() => setIsMeetingSummarizerOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold px-5 py-2.5 rounded-xl shadow-lg shrink-0 flex items-center gap-2 cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>{lang === 'ar' ? 'فتح خيار تلخيص المقابلات' : 'Open Meeting Summarizer'}</span>
        </Button>
      </Card>

      {/* DAILY EXECUTIVE REPORT BANNER CARD */}
      <Card className="relative overflow-hidden border-2 border-[var(--accent)] bg-[var(--bg-surface)] p-4 sm:p-5 space-y-3 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-3 rounded-2xl bg-[var(--accent)] text-white shadow-lg shrink-0 mt-0.5">
              <FileText className="w-6 h-6 animate-pulse" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-[var(--accent)] bg-[var(--accent)]/15 px-2 py-0.5 rounded-full border border-[var(--accent)]/30">
                  {lang === 'ar' ? 'التقرير التنفيذي اليومي 📋' : 'Executive Daily Report 📋'}
                </span>
                <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  {lang === 'ar' ? 'نسبة الإنجاز: ٧٥٪' : '75% Accomplished'}
                </span>
              </div>

              <h2 className="text-base sm:text-lg font-black text-[var(--text-primary)]">
                {lang === 'ar'
                  ? 'ملخص ما تم تنفيذه اليوم وما يتبقى من أهداف معلقة'
                  : 'Today\'s Executed Accomplishments & Pending Goals Summary'}
              </h2>

              <p className="text-xs text-[var(--text-secondary)] font-medium leading-relaxed max-w-2xl">
                {lang === 'ar'
                  ? 'تم إنجاز ٤ مهام واجتماعات رئيسية بنجاح، ويتبقى هدفين معلقين (شراء المستلزمات العائلية وإعداد الجدول). يمكنك استعراض التقرير التفصيلي أو تعديل الحالات بنقرة واحدة.'
                  : '4 primary tasks and briefings executed successfully today, with 2 items pending. View your full daily summary report or update statuses in one click.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
            <Button
              size="md"
              variant="primary"
              onClick={() => setIsDailyReportOpen(true)}
              icon={<Sparkles className="w-4 h-4 text-amber-300" />}
              className="shadow-lg hover:scale-105 transition-transform"
            >
              {lang === 'ar' ? 'فتح التقرير اليومي الشامل' : 'Open Full Daily Report'}
            </Button>
          </div>
        </div>
      </Card>

      {/* WORLD-CLASS FEATURE 1: INTERACTIVE DAY TIMELINE SCENARIO SIMULATOR */}
      <Card className="space-y-4 border-2 border-[var(--border-subtle)] bg-[var(--bg-surface)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 text-xs font-black text-[var(--accent)] uppercase tracking-wider">
              <Clock className="w-4 h-4" />
              <span>{lang === 'ar' ? 'محاكي سيناريو اليوم التنبؤي' : 'Predictive Timeline Simulator'}</span>
            </div>
            <h3 className="text-base font-extrabold text-[var(--text-primary)]">
              {lang === 'ar' ? 'استشراف تحولات السياق على مدار اليوم' : 'Forecast Context Morphing Across Day'}
            </h3>
          </div>

          <span className="text-xs text-[var(--text-muted)] font-mono font-bold bg-[var(--bg-base)] px-2.5 py-1 rounded-full border border-[var(--border-subtle)]">
            {lang === 'ar' ? 'سلسلة تنبؤات حية' : 'Live Scenario Mesh'}
          </span>
        </div>

        {/* Timeline Slot Selector Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          {TIMELINE_SLOTS.map((slot) => {
            const isSelected = selectedTimelineId === slot.id;
            return (
              <button
                key={slot.id}
                onClick={() => setSelectedTimelineId(slot.id)}
                className={`
                  p-3 rounded-2xl border text-start transition-all cursor-pointer active:scale-95 touch-manipulation space-y-1.5 relative overflow-hidden
                  ${
                    isSelected
                      ? 'bg-[var(--accent)] text-white border-[var(--accent)] shadow-lg ring-2 ring-[var(--accent)]/30'
                      : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)]'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-mono font-extrabold ${isSelected ? 'text-white' : 'text-[var(--accent)]'}`}>
                    {lang === 'ar' ? slot.timeAr : slot.timeEn}
                  </span>
                  <ContextBadge context={slot.context} size="sm" active={isSelected} />
                </div>

                <div className="text-xs font-extrabold line-clamp-1">
                  {lang === 'ar' ? slot.titleAr : slot.titleEn}
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Timeline Slot Simulation Details */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedSlot.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-2xl bg-[var(--bg-base)] border border-[var(--border-subtle)] flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-[var(--accent)]">
                  {lang === 'ar' ? 'التحول المتوقع عند:' : 'Forecasted Shift:'} {lang === 'ar' ? selectedSlot.timeAr : selectedSlot.timeEn}
                </span>
                <span className="text-[11px] font-mono font-bold bg-emerald-500/15 text-emerald-500 px-2 py-0.5 rounded-full">
                  {selectedSlot.predictedScore}% {lang === 'ar' ? 'دقة التنبؤ' : 'Accuracy'}
                </span>
              </div>
              <h4 className="text-sm font-black text-[var(--text-primary)]">
                {lang === 'ar' ? selectedSlot.titleAr : selectedSlot.titleEn}
              </h4>
              <p className="text-xs text-[var(--text-secondary)] font-medium leading-relaxed">
                {lang === 'ar' ? selectedSlot.aiNoteAr : selectedSlot.aiNoteEn}
              </p>
            </div>

            <Button
              size="sm"
              variant="primary"
              onClick={() => handleContextSelect(selectedSlot.context)}
              icon={<Zap className="w-4 h-4" />}
            >
              {lang === 'ar' ? 'تفعيل هذا السياق الآن' : 'Switch Context Now'}
            </Button>
          </motion.div>
        </AnimatePresence>
      </Card>

      {/* Grid Layout for Briefing, Focus, Tasks & Signals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main 2-Column: Daily Briefing & Priority Tasks */}
        <div className="lg:col-span-2 space-y-6">
          {/* Daily Predictive Briefing */}
          <Card className="space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <h3 className="text-base font-extrabold text-[var(--text-primary)] flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" />
                {t('dashboard.briefingTitle')}
              </h3>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsBriefModalOpen(true)}
                  icon={<FileText className="w-3.5 h-3.5" />}
                >
                  {lang === 'ar' ? 'التقرير التنفيذي' : 'Executive Brief'}
                </Button>
                <button
                  onClick={handleRefreshBriefing}
                  disabled={isRefreshingBriefing}
                  className="p-1.5 rounded-lg bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--accent)] transition-all cursor-pointer"
                  title={lang === 'ar' ? 'تحديث الملخص' : 'Refresh Briefing'}
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshingBriefing ? 'animate-spin text-[var(--accent)]' : ''}`} />
                </button>
              </div>
            </div>

            <p className="text-sm text-[var(--text-secondary)] leading-relaxed bg-[var(--bg-hover)] p-4 rounded-2xl border border-[var(--border-subtle)] font-medium">
              {t('dashboard.briefingText')}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-1">
                <span className="text-xs font-bold text-[var(--accent)] block">
                  {lang === 'ar' ? 'اجتماع المزامنة التفاعلي' : 'Sprint Sync Meeting'}
                </span>
                <span className="text-xs text-[var(--text-muted)] flex items-center gap-1 font-mono">
                  <Clock className="w-3.5 h-3.5 inline text-[var(--accent)]" /> {lang === 'ar' ? '٢:٠٠ م - ٣:٠٠ م' : '2:00 PM - 3:00 PM'}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-1">
                <span className="text-xs font-bold text-emerald-500 block">
                  {lang === 'ar' ? 'الانتقال التلقائي للسياق العائلي' : 'Auto Family Context Switch'}
                </span>
                <span className="text-xs text-[var(--text-muted)] flex items-center gap-1 font-mono">
                  <Clock className="w-3.5 h-3.5 inline text-emerald-500" /> {lang === 'ar' ? '٦:٠٠ م' : '6:00 PM'}
                </span>
              </div>
            </div>
          </Card>

          {/* Priority Tasks Widget */}
          <Card className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-3">
              <h3 className="text-base font-extrabold text-[var(--text-primary)] flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-[var(--accent)]" />
                {t('dashboard.priorityTasks')}
              </h3>
              <div className="flex items-center flex-wrap gap-2">
                <span className="text-xs font-semibold text-[var(--text-muted)]">
                  {tasks.filter((t) => t.done).length} / {tasks.length}{' '}
                  {lang === 'ar' ? 'مكتملة' : 'completed'}
                </span>

                {tasks.length > 0 ? (
                  <button
                    type="button"
                    onClick={handleClearAllTasks}
                    className="text-[11px] font-bold text-amber-500 hover:underline px-2 py-1 rounded bg-amber-500/10 cursor-pointer"
                    title={lang === 'ar' ? 'مسح كافة المهام للبدء بقائمة ناصعة حقيقية' : 'Clear all tasks for clean real state'}
                  >
                    {lang === 'ar' ? 'مسح الكل (بدء نظيف)' : 'Clear All'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleRestoreDemoTasks}
                    className="text-[11px] font-bold text-indigo-500 hover:underline px-2 py-1 rounded bg-indigo-500/10 cursor-pointer"
                  >
                    {lang === 'ar' ? 'استعادة العينات' : 'Restore Demo'}
                  </button>
                )}

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowAddTask(!showAddTask)}
                  icon={<Plus className="w-4 h-4" />}
                >
                  {lang === 'ar' ? 'إضافة مهمة' : 'Add Task'}
                </Button>
              </div>
            </div>

            {/* Inline Add Task Form */}
            {showAddTask && (
              <form onSubmit={handleAddTask} className="flex items-center gap-2 p-3 bg-[var(--bg-hover)] rounded-xl border border-[var(--border-subtle)]">
                <input
                  type="text"
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                  placeholder={lang === 'ar' ? 'أدخل عنوان المهمة بالسياق الحالي...' : 'Enter task title for active context...'}
                  className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                  autoFocus
                />
                <Button type="submit" size="sm" variant="primary">
                  {lang === 'ar' ? 'حفظ' : 'Add'}
                </Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => setShowAddTask(false)}>
                  {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                </Button>
              </form>
            )}

            <div className="space-y-2.5">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className={`
                    flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all duration-200 group
                    ${
                      task.done
                        ? 'bg-[var(--bg-hover)] border-[var(--border-subtle)] opacity-60 line-through'
                        : 'bg-[var(--bg-surface)] border-[var(--border-default)] hover:border-[var(--accent)]'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={task.done}
                      onChange={() => {}}
                      className="w-4 h-4 rounded text-[var(--accent)] cursor-pointer"
                    />
                    <span className="text-sm font-semibold text-[var(--text-primary)]">
                      {lang === 'ar' ? task.textAr : task.textEn}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <ContextBadge context={task.context as ContextType} size="sm" />
                    <button
                      onClick={(e) => deleteTask(task.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-500 transition-opacity"
                      title={lang === 'ar' ? 'حذف المهمة' : 'Delete task'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Sidebar Column: Focus Mode, Context Balance Radar & Live Signals */}
        <div className="space-y-6">
          {/* WORLD-CLASS FEATURE 2: CONTEXT BALANCE RADAR & WORK-LIFE HARMONY */}
          <Card className="space-y-4 bg-[var(--bg-surface)]">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <h3 className="text-base font-extrabold text-[var(--text-primary)] flex items-center gap-2">
                <PieChart className="w-5 h-5 text-indigo-500" />
                {lang === 'ar' ? 'توازن سياقات الحياة' : 'Work-Life Harmony'}
              </h3>
              <span className="text-xs font-mono font-black text-emerald-500 bg-emerald-500/15 px-2.5 py-1 rounded-full">
                94/100
              </span>
            </div>

            <div className="space-y-2.5">
              {[
                { nameAr: 'السياق المهني 💼', nameEn: 'Professional 💼', pct: 40, color: 'bg-indigo-500' },
                { nameAr: 'السياق العائلي 👨‍👩‍👧‍👦', nameEn: 'Family 👨‍👩‍👧‍👦', pct: 30, color: 'bg-pink-500' },
                { nameAr: 'السياق الشخصي 👤', nameEn: 'Personal 👤', pct: 15, color: 'bg-emerald-500' },
                { nameAr: 'سياق التعلم 🎓', nameEn: 'Learning 🎓', pct: 15, color: 'bg-amber-500' },
              ].map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-[var(--text-primary)]">
                    <span>{lang === 'ar' ? item.nameAr : item.nameEn}</span>
                    <span className="font-mono">{item.pct}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[var(--bg-base)] overflow-hidden">
                    <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] space-y-1">
              <span className="font-extrabold text-[var(--accent)] flex items-center gap-1">
                <Bot className="w-3.5 h-3.5" />
                {lang === 'ar' ? 'توصية التوأم الرقمي:' : 'Twin Insight:'}
              </span>
              <p className="leading-relaxed">
                {lang === 'ar'
                  ? 'التوزيع متزن جداً لليوم. ننصح بإنهاء المهام المهنية عند الساعة ٦ مساءً للحفاظ على الاستقرار العائلي.'
                  : 'Great distribution today. Recommend concluding work tasks by 6 PM to maintain family harmony.'}
              </p>
            </div>
          </Card>

          {/* Focus Mode Control Widget */}
          <Card className="space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <h3 className="text-base font-extrabold text-[var(--text-primary)] flex items-center gap-2">
                <VolumeX className="w-5 h-5 text-[var(--accent)]" />
                {t('dashboard.focusModeStatus')}
              </h3>
              <span
                className={`text-xs font-extrabold px-2.5 py-1 rounded-full ${
                  focusMode
                    ? 'bg-emerald-500/15 text-emerald-500'
                    : 'bg-amber-500/15 text-amber-500'
                }`}
              >
                {focusMode
                  ? lang === 'ar' ? 'مفعّل 🔇' : 'Active 🔇'
                  : lang === 'ar' ? 'إيقاف 🔔' : 'Disabled 🔔'}
              </span>
            </div>

            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              {lang === 'ar'
                ? 'يصفي نكسوس جميع الإشعارات غير التابعة للسياق الحالي لتجنب تشتيت الانتباه أثناء فترات التركيز.'
                : 'NEXUS automatically filters non-contextual alerts to prevent distractions during deep work sessions.'}
            </p>

            <Button
              fullWidth
              variant={focusMode ? 'secondary' : 'primary'}
              onClick={() => setFocusMode(!focusMode)}
            >
              {focusMode
                ? lang === 'ar' ? 'تعطيل وضع التركيز' : 'Disable Focus Mode'
                : lang === 'ar' ? 'تفعيل وضع التركيز التلقائي' : 'Enable Focus Mode'}
            </Button>
          </Card>

          {/* Live Signals & Integrations Hub */}
          <Card className="space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <h3 className="text-base font-extrabold text-[var(--text-primary)] flex items-center gap-2">
                <Layers className="w-5 h-5 text-cyan-400" />
                {t('dashboard.liveSignals')}
              </h3>
              <button
                onClick={handleSyncIntegrations}
                disabled={isSyncingIntegrations}
                className="p-1 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--accent)] transition-all cursor-pointer"
                title={lang === 'ar' ? 'مزامنة التطبيقات المتصلة' : 'Sync Connected Apps'}
              >
                <RefreshCw className={`w-4 h-4 ${isSyncingIntegrations ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-[var(--bg-hover)] border border-[var(--border-subtle)] space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-[var(--accent)]">Google Calendar</span>
                  <span className="text-[var(--text-muted)] font-mono">
                    {lang === 'ar' ? 'الآن' : 'Now'}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-medium">
                  {lang === 'ar'
                    ? 'تم رصد اجتماع في التقييم القادم عند الساعة ٢:٠٠ م.'
                    : 'Upcoming sync meeting detected on your calendar at 2:00 PM.'}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-[var(--bg-hover)] border border-[var(--border-subtle)] space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-emerald-500">
                    {lang === 'ar' ? 'الموقع الجغرافي' : 'Geolocation'}
                  </span>
                  <span className="text-[var(--text-muted)] font-mono">
                    {lang === 'ar' ? 'منذ ١٠ د' : '10m ago'}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-medium">
                  {lang === 'ar'
                    ? 'تم التواجد في المنطقة المهنية (المكتب الرئيسي).'
                    : 'Arrived at professional zone (HQ Office).' }
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-[var(--bg-hover)] border border-[var(--border-subtle)] space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-amber-400">Slack Integration</span>
                  <span className="text-[var(--text-muted)] font-mono">
                    {lang === 'ar' ? 'منذ ٢٥ د' : '25m ago'}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-medium">
                  {lang === 'ar'
                    ? 'تلقي ٣ رسائل عاجلة في قناة #project-nexus.'
                    : 'Received 3 urgent messages in #project-nexus channel.'}
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              fullWidth
              size="sm"
              onClick={() => onNavigate('graph')}
              icon={<ArrowUpRight className="w-4 h-4" />}
            >
              {lang === 'ar' ? 'عرض شبكة السياق الكاملة' : 'Explore Full Context Graph'}
            </Button>
          </Card>
        </div>
      </div>

      {/* CONFLICT RESOLUTION WIZARD MODAL */}
      <AnimatePresence>
        {isConflictModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-[var(--bg-surface)] border-2 border-[var(--danger)] rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl relative"
            >
              <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-red-500/15 text-red-500">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-[var(--text-primary)]">
                      {lang === 'ar' ? 'معالج حل تضارب المواعيد الذكي' : 'Smart Conflict Resolver Wizard'}
                    </h3>
                    <p className="text-xs text-[var(--text-muted)]">
                      {lang === 'ar' ? 'اختر الإجراء الأنسب للتوفيق بين الموعدين' : 'Select optimal resolution strategy'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsConflictModalOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                {[
                  {
                    titleAr: 'إعادة جدولة اجتماع السبرينت تلقائياً إلى غداً ١٠:٠٠ ص',
                    titleEn: 'Auto-reschedule sprint sync meeting to tomorrow 10:00 AM',
                    descAr: 'يرسل نكسوس طلباً آلياً لتغيير الموعد في Google Calendar ويخطر الفريق.',
                    descEn: 'NEXUS updates Google Calendar event and notifies participants.',
                    icon: Calendar,
                  },
                  {
                    titleAr: 'إرسال اعتذار لبق وصياغة رد ذكي عبر Slack',
                    titleEn: 'Send automated polite note & smart AI draft via Slack',
                    descAr: 'يقوم الذكاء الاصطناعي بصياغة اعتذار رسمي مع توضيح الارتباط العائلي.',
                    descEn: 'AI crafts professional polite delay message for Slack channel.',
                    icon: Send,
                  },
                  {
                    titleAr: 'تفويض المساعد الذكي NEXUS للحضور وتسجيل المحضر',
                    titleEn: 'Delegate NEXUS AI Assistant to attend & transcribe',
                    descAr: 'يحضر المساعد الرقمي الاجتماع عبر Google Meet ويزودك بالملخص التنفيذي.',
                    descEn: 'Digital Twin joins Meet, records key decisions, and sends summary.',
                    icon: Bot,
                  },
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleExecuteResolution(lang === 'ar' ? item.titleAr : item.titleEn)}
                      className="w-full text-start p-4 rounded-2xl bg-[var(--bg-hover)] border border-[var(--border-subtle)] hover:border-[var(--accent)] hover:bg-[var(--bg-surface)] transition-all cursor-pointer group space-y-1"
                    >
                      <div className="flex items-center gap-2 font-bold text-xs text-[var(--text-primary)] group-hover:text-[var(--accent)]">
                        <Icon className="w-4 h-4 text-[var(--accent)] shrink-0" />
                        <span>{lang === 'ar' ? item.titleAr : item.titleEn}</span>
                      </div>
                      <p className="text-[11px] text-[var(--text-muted)] pl-6 rtl:pr-6">
                        {lang === 'ar' ? item.descAr : item.descEn}
                      </p>
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-end pt-2">
                <Button variant="ghost" size="sm" onClick={() => setIsConflictModalOpen(false)}>
                  {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EXECUTIVE PRE-MEETING BRIEFING MODAL */}
      <AnimatePresence>
        {isBriefModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-[var(--bg-surface)] border-2 border-[var(--accent)] rounded-3xl p-6 max-w-xl w-full space-y-5 shadow-2xl relative max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-xl bg-[var(--accent)]/15 text-[var(--accent)]">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-[var(--text-primary)]">
                      {lang === 'ar' ? 'التقرير التنفيذي لاجتماع المزامنة' : 'Executive Pre-Meeting Briefing'}
                    </h3>
                    <p className="text-xs text-[var(--text-muted)]">
                      {lang === 'ar' ? 'تحليل ذكي تلقائي مسبق قبل انطلاق الاجتماع' : 'Automated pre-meeting intelligence brief'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsBriefModalOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs text-[var(--text-primary)]">
                <div className="p-3.5 rounded-2xl bg-[var(--bg-hover)] border border-[var(--border-subtle)] space-y-2">
                  <span className="font-extrabold text-[var(--accent)] block uppercase tracking-wider text-[11px]">
                    🎯 {lang === 'ar' ? 'الهدف الرئيسي للاجتماع' : 'Primary Objective'}
                  </span>
                  <p className="leading-relaxed">
                    {lang === 'ar'
                      ? 'اعتماد خوارزمية التنبؤ بالسياقات v3.6 وحسم تضارب المواعيد بين السياق المهني والعائلي.'
                      : 'Approve context prediction algorithm v3.6 and set conflict resolution thresholds.'}
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="font-extrabold text-[var(--text-primary)] block text-xs">
                    📌 {lang === 'ar' ? 'محاور النقاش الأساسية:' : 'Key Discussion Points:'}
                  </span>
                  <ul className="space-y-1.5 text-[11px] text-[var(--text-secondary)] list-disc pl-5 rtl:pr-5">
                    <li>{lang === 'ar' ? 'مراجعة أداء نموذج التنبؤ الجغرافي ودقته (94%).' : 'Review location prediction accuracy (94%).'}</li>
                    <li>{lang === 'ar' ? 'مزامنة تنبيهات Slack بدون إزعاج أثناء وضع التركيز.' : 'Slack alert filtering under active focus mode.'}</li>
                    <li>{lang === 'ar' ? 'تحديد حدود التداخل المسموح به بين السياقات.' : 'Setting allowed overlap tolerance between contexts.'}</li>
                  </ul>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-semibold space-y-1">
                  <span>✅ {lang === 'ar' ? 'التوصية التلقائية للنظام:' : 'System Action Recommendation:'}</span>
                  <p className="text-[11px] leading-relaxed">
                    {lang === 'ar'
                      ? 'الموافقة على تحديث الخوارزمية وتفعيل وضع كتم الإشعارات التلقائي بعد الساعة ٦:٠٠ م.'
                      : 'Approve algorithm update and enable auto-mute after 6:00 PM.'}
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button variant="primary" size="sm" onClick={() => setIsBriefModalOpen(false)}>
                  {lang === 'ar' ? 'فهمت التقرير' : 'Acknowledge Brief'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Daily Executive Report Full Modal */}
      <DailyReportModal
        isOpen={isDailyReportOpen}
        onClose={() => setIsDailyReportOpen(false)}
        onOpenAIModal={onOpenAIModal}
      />

      {/* AI Meeting & Interview Summarizer Modal */}
      <MeetingSummarizerModal
        isOpen={isMeetingSummarizerOpen}
        onClose={() => setIsMeetingSummarizerOpen(false)}
        onAddTask={(title, ctx) => {
          const newTask = {
            id: Date.now(),
            textAr: title,
            textEn: title,
            done: false,
            context: (ctx as ContextType) || 'professional',
          };
          setTasks((prev) => [newTask, ...prev]);
          triggerNotice(lang === 'ar' ? 'تمت إضافة المهمة من نتائج الاجتماع بنجاح ✓' : 'Task added from meeting summary ✓');
        }}
      />
    </div>
  );
};
