import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  Sparkles,
  Calendar,
  BarChart3,
  ArrowUpRight,
  Plus,
  Trash2,
  Copy,
  Download,
  Share2,
  RefreshCw,
  Send,
  Check,
  Zap,
  TrendingUp,
  Brain,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { useLang } from '../../hooks/useLang';
import { getDualDateString } from '../../utils/dateUtils';
import { downloadHtmlReport } from '../../utils/exportReport';
import { Button } from './Button';

interface ReportItem {
  id: string;
  titleAr: string;
  titleEn: string;
  executed: boolean;
  timeAr: string;
  timeEn: string;
  category: 'professional' | 'family' | 'learning' | 'personal';
  notesAr?: string;
  notesEn?: string;
}

interface DailyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAIModal?: () => void;
}

export const DailyReportModal: React.FC<DailyReportModalProps> = ({
  isOpen,
  onClose,
  onOpenAIModal,
}) => {
  const { lang, isRTL } = useLang();
  const [activeTab, setActiveTab] = useState<'overview' | 'executed' | 'pending' | 'insights'>('overview');
  const [copyToast, setCopyToast] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Sample initial daily tasks & report data
  const [items, setItems] = useState<ReportItem[]>([
    {
      id: 'r1',
      titleAr: 'مراجعة خوارزمية التنبؤ بالسياق واختبار الدقة',
      titleEn: 'Review context prediction algorithm and test accuracy',
      executed: true,
      timeAr: '١٠:٣٠ ص',
      timeEn: '10:30 AM',
      category: 'professional',
      notesAr: 'تم اجتياز اختبارات الدقة بنسبة ٩٦٪ مع فريق التطوير',
      notesEn: 'Passed accuracy tests at 96% with dev team',
    },
    {
      id: 'r2',
      titleAr: 'قراءة الفصل الثالث من كتاب التعلّم العميق المتقدم',
      titleEn: 'Read Chapter 3 of Advanced Deep Learning book',
      executed: true,
      timeAr: '٠١:١٥ م',
      timeEn: '01:15 PM',
      category: 'learning',
      notesAr: 'تم تلخيص النقاط المفتاحية ونقلها للمفكرة الرقمية',
      notesEn: 'Key points summarized and logged to digital notebook',
    },
    {
      id: 'r3',
      titleAr: 'اجتماع سبرينت التنسيق اليومي مع Slack & Notion',
      titleEn: 'Daily sync meeting with Slack & Notion teams',
      executed: true,
      timeAr: '٠٣:٠٠ م',
      timeEn: '03:00 PM',
      category: 'professional',
      notesAr: 'تمت مزامنة ٤ مشاريع رئيسية واعتماد خطة الأسبوع',
      notesEn: '4 main projects synced and weekly plan approved',
    },
    {
      id: 'r4',
      titleAr: 'تطبيق تمارين وضع التركيز وقياس مؤشرات الصحة',
      titleEn: 'Focus mode session and HealthKit metric sync',
      executed: true,
      timeAr: '٠٥:٠٠ م',
      timeEn: '05:00 PM',
      category: 'personal',
      notesAr: 'معدل التركيز المتواصل بلغ ٨٥ دقيقة بدون مقاطعات',
      notesEn: 'Uninterrupted deep focus lasted 85 minutes',
    },
    {
      id: 'r5',
      titleAr: 'شراء المستلزمات العائلية وحجز موعد العشاء',
      titleEn: 'Buy family groceries and confirm dinner reservation',
      executed: false,
      timeAr: '٠٦:٣٠ م',
      timeEn: '06:30 PM',
      category: 'family',
      notesAr: 'معلق - بانتظار تأكيد الصيدلية والمستلزمات الطبية',
      notesEn: 'Pending pharmacy confirmation and medical supplies',
    },
    {
      id: 'r6',
      titleAr: 'إعداد الجدول التنفيذي والتنبؤات اليومية للغد',
      titleEn: 'Prepare executive schedule and predictions for tomorrow',
      executed: false,
      timeAr: '٠٩:٠٠ م',
      timeEn: '09:00 PM',
      category: 'professional',
      notesAr: 'معلق - سيقوم J.A.R.V.I.S بالمعالجة التلقائية منتصف الليل',
      notesEn: 'Pending - J.A.R.V.I.S will auto-run at midnight',
    },
  ]);

  const [newItemTitle, setNewItemTitle] = useState<string>('');
  const [newItemCategory, setNewItemCategory] = useState<ReportItem['category']>('professional');
  const [showAddForm, setShowAddForm] = useState<boolean>(false);

  const executedItems = items.filter((i) => i.executed);
  const pendingItems = items.filter((i) => !i.executed);
  const completionRate = Math.round((executedItems.length / (items.length || 1)) * 100);

  const toggleItemExecution = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, executed: !item.executed } : item
      )
    );
  };

  const addItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemTitle.trim()) return;
    const now = new Date();
    const timeStr = now.toLocaleTimeString(lang === 'ar' ? 'ar-SA' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
    const newItem: ReportItem = {
      id: Date.now().toString(),
      titleAr: newItemTitle.trim(),
      titleEn: newItemTitle.trim(),
      executed: false,
      timeAr: timeStr,
      timeEn: timeStr,
      category: newItemCategory,
    };
    setItems((prev) => [newItem, ...prev]);
    setNewItemTitle('');
    setShowAddForm(false);
  };

  const deleteItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const deferToTomorrow = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              notesAr: 'تم التأجيل إلى جدول أهداف الغد 🗓️',
              notesEn: 'Postponed to tomorrow\'s goals schedule 🗓️',
            }
          : item
      )
    );
  };

  const handleCopyReport = () => {
    const dates = getDualDateString(lang);
    const todayStr = dates.combined;

    const reportText =
      lang === 'ar'
        ? `📋 التقرير اليومي الشامل (NEXUS Executive Daily Report)
📅 التاريخ: ${todayStr}
📊 نسبة الإنجاز اليومية: ${completionRate}٪ (${executedItems.length} من ${items.length} أهداف)

✅ ما تم تنفيذه اليوم (${executedItems.length}):
${executedItems.map((i, idx) => `${idx + 1}. [${i.timeAr}] ${i.titleAr}`).join('\n')}

⏳ ما لم يتم تنفيذه / معلق (${pendingItems.length}):
${pendingItems.map((i, idx) => `${idx + 1}. [${i.timeAr}] ${i.titleAr} (${i.notesAr || 'معلق'})`).join('\n')}

💡 تقييم الذكاء الاصطناعي (J.A.R.V.I.S):
مستوى الإنتاجية اليومي ممتاز. يوصى بإزاحة المهام المعلقة لمستهل الصباح الباكر لضمان جودة الأداء.`
        : `📋 NEXUS Executive Daily Summary
📅 Date: ${todayStr}
📊 Daily Completion Rate: ${completionRate}% (${executedItems.length}/${items.length} tasks)

✅ Executed Today (${executedItems.length}):
${executedItems.map((i, idx) => `${idx + 1}. [${i.timeEn}] ${i.titleEn}`).join('\n')}

⏳ Unexecuted / Pending (${pendingItems.length}):
${pendingItems.map((i, idx) => `${idx + 1}. [${i.timeEn}] ${i.titleEn} (${i.notesEn || 'Pending'})`).join('\n')}

💡 AI Twin Insight (J.A.R.V.I.S):
High focus performance. Deferred items recommended for early morning schedule.`;

    navigator.clipboard.writeText(reportText);
    setCopyToast(true);
    setTimeout(() => setCopyToast(false), 2500);
  };

  const handleDownloadReport = () => {
    const dates = getDualDateString(lang);
    const todayStr = dates.combined;

    downloadHtmlReport({
      title: lang === 'ar' ? 'التقرير التنفيذي اليومي الشامل' : 'NEXUS Executive Daily Report',
      subtitle: `${lang === 'ar' ? 'تقرير الإنجاز والمهام اليومية' : 'Daily Progress & Tasks Overview'} - ${todayStr}`,
      filename: `nexus_daily_report_${new Date().toISOString().slice(0, 10)}.html`,
      lang: lang === 'ar' ? 'ar' : 'en',
      sections: [
        {
          title: lang === 'ar' ? 'مؤشرات معدل الإنجاز اليومي' : 'Daily Productivity Key Metrics',
          metrics: [
            { label: lang === 'ar' ? 'نسبة الإنجاز' : 'Completion Rate', value: `${completionRate}%`, color: completionRate >= 70 ? 'emerald' : 'amber' },
            { label: lang === 'ar' ? 'المهام المنفذة' : 'Executed Items', value: executedItems.length, color: 'emerald' },
            { label: lang === 'ar' ? 'المهام المعلقة' : 'Pending Items', value: pendingItems.length, color: 'amber' },
            { label: lang === 'ar' ? 'إجمالي الأهداف' : 'Total Planned', value: items.length, color: 'cyan' },
          ],
        },
        {
          title: lang === 'ar' ? 'جدول كافة مهام واجتماعات اليوم' : 'Daily Tasks & Meetings Table',
          table: {
            headers: [
              lang === 'ar' ? 'عنوان المهمة / الحدث' : 'Task/Meeting Title',
              lang === 'ar' ? 'التصنيف' : 'Category',
              lang === 'ar' ? 'الوقت المخصص' : 'Scheduled Time',
              lang === 'ar' ? 'الحالة التنفيذية' : 'Execution Status',
            ],
            rows: items.map(i => [
              lang === 'ar' ? i.titleAr : i.titleEn,
              i.category.toUpperCase(),
              lang === 'ar' ? i.timeAr : i.timeEn,
              i.executed ? (lang === 'ar' ? 'تم التنفيذ ✓' : 'Executed ✓') : (lang === 'ar' ? 'معلق ⏳' : 'Pending ⏳'),
            ]),
          },
        },
        {
          title: lang === 'ar' ? 'توصيات المساعد التنبؤي' : 'Predictive Assistant Guidance',
          bullets: [
            lang === 'ar' ? '• الملاحظة التنفيذية: تم تحقيق معدل استقرار عالٍ في إدارة السياق والتوازن بين المهام.' : '• Executive Insight: Maintained high stability in task balance and context management.',
            lang === 'ar' ? '• التوجيه القادم: يوصى بترحيل المهام غير المنجزة مباشرة إلى الجدول الصباحي.' : '• Next Action: Recommended to carry over unexecuted items directly to the morning schedule.',
          ],
        },
      ],
    });
  };

  const handleRegenerateReport = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-md"
        />

        {/* Modal Window Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="
            relative z-10 w-full max-w-3xl bg-[var(--bg-surface)] border-2 border-[var(--border-subtle)]
            rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh] my-auto
          "
        >
          {/* Header Bar */}
          <div className="p-4 sm:p-5 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-[var(--accent)]/15 text-[var(--accent)] border border-[var(--accent)]/30">
                <FileText className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-black text-[var(--text-primary)]">
                    {lang === 'ar' ? 'التقرير اليومي الشامل' : 'Daily Executive Report'}
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                    {completionRate >= 70
                      ? lang === 'ar'
                        ? 'أداء ممتاز 🚀'
                        : 'High Performance 🚀'
                      : lang === 'ar'
                      ? 'قيد الإنجاز ⏱️'
                      : 'In Progress ⏱️'}
                  </span>
                </div>
                <p className="text-xs font-medium text-[var(--text-muted)] flex items-center gap-1.5 mt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-[var(--accent)]" />
                  <span>{getDualDateString(lang).combined}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadReport}
                className="p-2 rounded-xl text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10 transition-all cursor-pointer flex items-center gap-1 text-xs font-extrabold border border-indigo-500/30"
                title={lang === 'ar' ? 'تنزيل التقرير المنسق (TXT)' : 'Download Formatted Report (TXT)'}
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">{lang === 'ar' ? 'تنزيل التقرير (TXT)' : 'Download Report'}</span>
              </button>

              <button
                onClick={handleCopyReport}
                className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all cursor-pointer hidden sm:flex items-center gap-1 text-xs font-bold"
                title={lang === 'ar' ? 'نسخ التقرير' : 'Copy Report'}
              >
                <Copy className="w-4 h-4" />
                <span>{lang === 'ar' ? 'نسخ' : 'Copy'}</span>
              </button>

              <button
                onClick={onClose}
                className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Metrics & Progress Header */}
          <div className="p-4 sm:p-5 bg-[var(--bg-hover)]/60 border-b border-[var(--border-subtle)] space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-1 w-full sm:w-auto">
                <div className="flex items-center justify-between sm:justify-start gap-3">
                  <span className="text-xs font-black text-[var(--text-secondary)]">
                    {lang === 'ar' ? 'نسبة الإنجاز اليومي:' : 'Daily Completion Rate:'}
                  </span>
                  <span className="text-sm font-black text-[var(--accent)]">
                    {completionRate}% ({executedItems.length} {lang === 'ar' ? 'من' : 'of'} {items.length})
                  </span>
                </div>
                {/* Progress bar */}
                <div className="w-full sm:w-64 h-2.5 bg-[var(--bg-surface)] rounded-full overflow-hidden border border-[var(--border-subtle)]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${completionRate}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-full bg-[var(--accent)] rounded-full"
                  />
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleRegenerateReport}
                  disabled={isGenerating}
                  icon={<RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />}
                >
                  {lang === 'ar' ? 'تحديث بالذكاء الاصطناعي' : 'AI Refresh'}
                </Button>

                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => setShowAddForm((prev) => !prev)}
                  icon={<Plus className="w-3.5 h-3.5" />}
                >
                  {lang === 'ar' ? 'إضافة إنجاز / هدف' : 'Add Item'}
                </Button>
              </div>
            </div>

            {/* Quick Add Form Dropdown */}
            <AnimatePresence>
              {showAddForm && (
                <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={addItem}
                  className="pt-2 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row items-center gap-2"
                >
                  <input
                    type="text"
                    value={newItemTitle}
                    onChange={(e) => setNewItemTitle(e.target.value)}
                    placeholder={
                      lang === 'ar'
                        ? 'اكتب اسم المهمة أو الإنجاز للتقرير اليومي...'
                        : 'Enter task or accomplishment title...'
                    }
                    className="flex-1 px-3.5 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] w-full"
                  />
                  <select
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value as any)}
                    className="px-3 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs font-bold text-[var(--text-primary)] focus:outline-none"
                  >
                    <option value="professional">{lang === 'ar' ? 'مهني 💼' : 'Professional'}</option>
                    <option value="family">{lang === 'ar' ? 'عائلي 👨‍👩‍👧‍👦' : 'Family'}</option>
                    <option value="learning">{lang === 'ar' ? 'تعلم 🎓' : 'Learning'}</option>
                    <option value="personal">{lang === 'ar' ? 'شخصي 👤' : 'Personal'}</option>
                  </select>
                  <Button size="sm" variant="primary" type="submit">
                    {lang === 'ar' ? 'حفظ' : 'Save'}
                  </Button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          {/* Toast feedback for copy action */}
          {copyToast && (
            <div className="bg-emerald-500 text-white text-xs font-extrabold text-center py-1.5 px-4 animate-fade-in flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>
                {lang === 'ar'
                  ? 'تم نسخ ملخص التقرير التنفيذي بنجاح للحافظة! 📋'
                  : 'Daily summary copied to clipboard! 📋'}
              </span>
            </div>
          )}

          {/* Navigation Tabs Bar */}
          <div className="flex items-center gap-1 px-4 pt-3 border-b border-[var(--border-subtle)] overflow-x-auto">
            {[
              { id: 'overview', labelAr: 'نظرة عامة والملخص', labelEn: 'Overview & Summary', icon: FileText },
              { id: 'executed', labelAr: `تم تنفيذه (${executedItems.length})`, labelEn: `Executed (${executedItems.length})`, icon: CheckCircle2 },
              { id: 'pending', labelAr: `معلق / لم ينفذ (${pendingItems.length})`, labelEn: `Pending (${pendingItems.length})`, icon: Clock },
              { id: 'insights', labelAr: 'توصيات الجيل القادم', labelEn: 'AI Insights', icon: Sparkles },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`
                    px-3.5 py-2 rounded-t-xl font-extrabold text-xs flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap
                    ${
                      isActive
                        ? 'border-[var(--accent)] text-[var(--accent)] bg-[var(--bg-hover)]'
                        : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span>{lang === 'ar' ? tab.labelAr : tab.labelEn}</span>
                </button>
              );
            })}
          </div>

          {/* Modal Body Content */}
          <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 min-h-[320px]">
            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-6 animate-fade-in">
                {/* AI Executive Assessment Banner */}
                <div className="p-4 rounded-2xl bg-[var(--bg-hover)] border border-[var(--accent)]/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Brain className="w-5 h-5 text-[var(--accent)]" />
                      <span className="text-xs font-black text-[var(--text-primary)]">
                        {lang === 'ar' ? 'تقييم التوأم الرقمي (J.A.R.V.I.S Daily Evaluation)' : 'J.A.R.V.I.S Daily Evaluation'}
                      </span>
                    </div>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[var(--accent)]/20 text-[var(--accent)]">
                      {lang === 'ar' ? 'مؤشر الأداء: ٩٢٪' : 'Performance Index: 92%'}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-medium">
                    {lang === 'ar'
                      ? 'حققت أداءً ممتازاً اليوم بالتركيز على سبرينت التطوير ومزامنة الاجتماعات. تم إنجاز ٣ أهداف مهنية ورئيسية. يتبقى هدف الشراء العائلي وإعادة التنظيم، وتأجيلهما لمساء الغد لن يؤثر على الأولويات.'
                      : 'Excellent performance today focusing on development sprint and sync meetings. 3 key professional goals executed. Grocery run remains pending and can be safely deferred to tomorrow evening.'}
                  </p>
                </div>

                {/* Two Column Grid: Executed vs Pending */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Executed Card */}
                  <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-3">
                    <div className="flex items-center justify-between border-b border-emerald-500/15 pb-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                          {lang === 'ar' ? 'ما تم تنفيذه بنجاح' : 'Executed Today'}
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                        ({executedItems.length})
                      </span>
                    </div>

                    <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                      {executedItems.length === 0 ? (
                        <p className="text-xs text-[var(--text-muted)] italic py-2 text-center">
                          {lang === 'ar' ? 'لم يتم تنفيذ أي عنصر بعد' : 'No items executed yet.'}
                        </p>
                      ) : (
                        executedItems.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => toggleItemExecution(item.id)}
                            className="p-2.5 rounded-xl bg-[var(--bg-surface)] border border-emerald-500/20 flex items-start gap-2.5 cursor-pointer hover:border-emerald-500/40 transition-all group"
                          >
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <span className="text-xs font-bold text-[var(--text-primary)] block line-through opacity-85">
                                {lang === 'ar' ? item.titleAr : item.titleEn}
                              </span>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] text-[var(--text-muted)]">
                                  {lang === 'ar' ? item.timeAr : item.timeEn}
                                </span>
                                {item.notesAr && (
                                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 truncate">
                                    • {lang === 'ar' ? item.notesAr : item.notesEn}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Unexecuted / Pending Card */}
                  <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-3">
                    <div className="flex items-center justify-between border-b border-amber-500/15 pb-2">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-500" />
                        <span className="text-xs font-black text-amber-600 dark:text-amber-400">
                          {lang === 'ar' ? 'ما لم يتم تنفيذه / معلق' : 'Unexecuted / Pending'}
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                        ({pendingItems.length})
                      </span>
                    </div>

                    <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                      {pendingItems.length === 0 ? (
                        <p className="text-xs text-[var(--text-muted)] italic py-2 text-center">
                          {lang === 'ar' ? 'رائع! تم تنفيذ جميع الأهداف اليوم 🎉' : 'Awesome! All items executed today 🎉'}
                        </p>
                      ) : (
                        pendingItems.map((item) => (
                          <div
                            key={item.id}
                            className="p-2.5 rounded-xl bg-[var(--bg-surface)] border border-amber-500/20 space-y-1.5"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-start gap-2">
                                <button
                                  onClick={() => toggleItemExecution(item.id)}
                                  className="w-4 h-4 rounded-full border border-amber-500 shrink-0 mt-0.5 hover:bg-emerald-500/20 transition-all cursor-pointer"
                                  title={lang === 'ar' ? 'تعليم كمنجز' : 'Mark executed'}
                                />
                                <span className="text-xs font-bold text-[var(--text-primary)]">
                                  {lang === 'ar' ? item.titleAr : item.titleEn}
                                </span>
                              </div>
                              <span className="text-[10px] text-amber-500 font-extrabold shrink-0">
                                {lang === 'ar' ? item.timeAr : item.timeEn}
                              </span>
                            </div>

                            <div className="flex items-center justify-between gap-2 pt-1 border-t border-[var(--border-subtle)]">
                              <span className="text-[10px] text-[var(--text-muted)] truncate">
                                {item.notesAr ? (lang === 'ar' ? item.notesAr : item.notesEn) : (lang === 'ar' ? 'معلق' : 'Pending')}
                              </span>
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  onClick={() => deferToTomorrow(item.id)}
                                  className="px-2 py-0.5 rounded-lg bg-[var(--bg-hover)] text-[10px] font-bold text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white transition-all cursor-pointer"
                                >
                                  {lang === 'ar' ? 'تأجيل للغد' : 'Defer'}
                                </button>
                                <button
                                  onClick={() => toggleItemExecution(item.id)}
                                  className="px-2 py-0.5 rounded-lg bg-emerald-500/15 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all cursor-pointer"
                                >
                                  {lang === 'ar' ? 'تم التنفيذ' : 'Mark Done'}
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Context Time Distribution */}
                <div className="p-4 rounded-2xl bg-[var(--bg-hover)]/70 border border-[var(--border-subtle)] space-y-3">
                  <h4 className="text-xs font-black text-[var(--text-primary)] flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-[var(--accent)]" />
                    {lang === 'ar' ? 'توزيع التركيز وساعات العمل حسب السياق اليوم:' : 'Focus Time Distribution by Context Today:'}
                  </h4>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {[
                      { labelAr: 'المهني 💼', labelEn: 'Professional 💼', val: '٤.٥ ساعة (٤٥٪)', color: 'bg-cyan-500' },
                      { labelAr: 'التعلم 🎓', labelEn: 'Learning 🎓', val: '٢.٠ ساعة (٢٠٪)', color: 'bg-indigo-500' },
                      { labelAr: 'العائلي 👨‍👩‍👧‍👦', labelEn: 'Family 👨‍👩‍👧‍👦', val: '٢.٥ ساعة (٢٥٪)', color: 'bg-emerald-500' },
                      { labelAr: 'الشخصي 👤', labelEn: 'Personal 👤', val: '١.٠ ساعة (١٠٪)', color: 'bg-amber-500' },
                    ].map((ctx, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${ctx.color}`} />
                          <span className="text-xs font-extrabold text-[var(--text-primary)]">
                            {lang === 'ar' ? ctx.labelAr : ctx.labelEn}
                          </span>
                        </div>
                        <span className="text-[11px] font-bold text-[var(--text-secondary)] block">
                          {ctx.val}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: EXECUTED ITEMS ONLY */}
            {activeTab === 'executed' && (
              <div className="space-y-3 animate-fade-in">
                <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)]">
                  <h3 className="text-xs font-black text-[var(--text-primary)]">
                    {lang === 'ar' ? 'قائمة المهام والإنجازات التي تم تنفيذها اليوم:' : 'Full List of Executed Items Today:'}
                  </h3>
                  <span className="text-xs font-bold text-emerald-500">
                    {executedItems.length} {lang === 'ar' ? 'منجزات' : 'items'}
                  </span>
                </div>

                {executedItems.length === 0 ? (
                  <div className="py-12 text-center space-y-2">
                    <Clock className="w-8 h-8 text-[var(--text-muted)] mx-auto opacity-50" />
                    <p className="text-xs text-[var(--text-muted)]">
                      {lang === 'ar' ? 'لا يوجد أي عناصر منفذة حتى الآن' : 'No items executed yet.'}
                    </p>
                  </div>
                ) : (
                  executedItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-2xl bg-[var(--bg-hover)] border border-emerald-500/30 flex items-center justify-between gap-3 group"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                        <div className="space-y-0.5 min-w-0">
                          <span className="text-xs font-black text-[var(--text-primary)] block line-through opacity-85">
                            {lang === 'ar' ? item.titleAr : item.titleEn}
                          </span>
                          <p className="text-[10px] text-[var(--text-muted)]">
                            {item.notesAr ? (lang === 'ar' ? item.notesAr : item.notesEn) : (lang === 'ar' ? 'تم الإنجاز بنجاح' : 'Executed successfully')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-lg bg-emerald-500/10">
                          {lang === 'ar' ? item.timeAr : item.timeEn}
                        </span>
                        <button
                          onClick={() => toggleItemExecution(item.id)}
                          className="text-[10px] font-bold text-[var(--text-muted)] hover:text-amber-500 transition-all cursor-pointer"
                        >
                          {lang === 'ar' ? 'إعادة للمعلق' : 'Undo'}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB 3: PENDING / UNEXECUTED ITEMS */}
            {activeTab === 'pending' && (
              <div className="space-y-3 animate-fade-in">
                <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)]">
                  <h3 className="text-xs font-black text-[var(--text-primary)]">
                    {lang === 'ar' ? 'قائمة المهام والتنبيهات المعلقة التي لم تنفذ:' : 'Full List of Unexecuted / Pending Items:'}
                  </h3>
                  <span className="text-xs font-bold text-amber-500">
                    {pendingItems.length} {lang === 'ar' ? 'معلقات' : 'pending'}
                  </span>
                </div>

                {pendingItems.length === 0 ? (
                  <div className="py-12 text-center space-y-2">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto animate-bounce" />
                    <p className="text-xs font-bold text-[var(--text-primary)]">
                      {lang === 'ar' ? 'كل الأهداف منجزة! لا يوجد أي أهداف معلقة اليوم.' : 'All goals completed! No pending items today.'}
                    </p>
                  </div>
                ) : (
                  pendingItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-2xl bg-[var(--bg-hover)] border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <Clock className="w-5 h-5 text-amber-500 shrink-0 mt-0.5 animate-pulse" />
                        <div className="space-y-0.5 min-w-0">
                          <span className="text-xs font-black text-[var(--text-primary)] block">
                            {lang === 'ar' ? item.titleAr : item.titleEn}
                          </span>
                          <p className="text-[10px] text-[var(--text-muted)]">
                            {item.notesAr ? (lang === 'ar' ? item.notesAr : item.notesEn) : (lang === 'ar' ? 'معلق بانتظار الإنجاز' : 'Pending execution')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deferToTomorrow(item.id)}
                        >
                          {lang === 'ar' ? 'تأجيل للغد 🗓️' : 'Defer to Tomorrow'}
                        </Button>
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => toggleItemExecution(item.id)}
                          icon={<Check className="w-3.5 h-3.5" />}
                        >
                          {lang === 'ar' ? 'تم التنفيذ' : 'Mark Done'}
                        </Button>
                        <button
                          onClick={() => deleteItem(item.id)}
                          className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB 4: AI RECOMMENDATIONS & INSIGHTS */}
            {activeTab === 'insights' && (
              <div className="space-y-4 animate-fade-in">
                <div className="p-4 rounded-2xl bg-[var(--bg-hover)] border border-[var(--border-subtle)] space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-400 animate-spin" />
                    <h3 className="text-xs font-black text-[var(--text-primary)]">
                      {lang === 'ar' ? 'توصيات الجيل القادم لجدول الغد:' : 'Next-Gen AI Recommendations for Tomorrow:'}
                    </h3>
                  </div>

                  <div className="space-y-2.5">
                    {[
                      {
                        titleAr: 'توزيع الحمل الصباحي للتركيز الأقصى',
                        titleEn: 'Morning Deep Work Allocation',
                        descAr: 'البدء بتنفيذ الهدف المعلق (شراء مستلزمات العائلة) في تمام الساعة ٠٩:٠٠ ص قبل بدء جلسات التطوير.',
                        descEn: 'Execute pending grocery run at 09:00 AM before development sessions start.',
                      },
                      {
                        titleAr: 'كتم الإشعارات أثناء جلسة التعلّم العميق',
                        titleEn: 'Notification Shielding for Learning',
                        descAr: 'تطبيق فلترة Slack التلقائية من الساعة ٠١:٠٠ م إلى ٠٢:٣٠ م لتفادي التشتت.',
                        descEn: 'Apply automated Slack shielding from 01:00 PM to 02:30 PM.',
                      },
                      {
                        titleAr: 'مزامنة التوأم الرقمي J.A.R.V.I.S منتصف الليل',
                        titleEn: 'Midnight J.A.R.V.I.S Auto-Sync',
                        descAr: 'يقوم النظام بإعادة ضبط المخطط البياني وتحديث التنبؤات وفقاً لما تم تنفيذه اليوم.',
                        descEn: 'System will rebalance the context graph based on today\'s achievements.',
                      },
                    ].map((rec, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-1">
                        <span className="text-xs font-bold text-[var(--accent)] block">
                          💡 {lang === 'ar' ? rec.titleAr : rec.titleEn}
                        </span>
                        <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                          {lang === 'ar' ? rec.descAr : rec.descEn}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Assistant Quick Prompt Box */}
                {onOpenAIModal && (
                  <div className="p-4 rounded-2xl bg-indigo-600 text-white space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-amber-300 animate-bounce" />
                        <span className="text-xs font-black">
                          {lang === 'ar' ? 'هل تريد تحليل التقرير وتكليف المساعد بالمعلقات؟' : 'Have AI Assistant handle your pending items?'}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-cyan-100 leading-snug">
                      {lang === 'ar'
                        ? 'يمكن لـ J.A.R.V.I.S إعادة جدولة الأهداف المعلقة تلقائياً وإعادة إرسال التنبيهات في الأوقات الأنسب.'
                        : 'J.A.R.V.I.S can automatically reschedule pending items and alert you at optimal times.'}
                    </p>
                    <Button
                      fullWidth
                      variant="primary"
                      onClick={() => {
                        onClose();
                        onOpenAIModal();
                      }}
                      icon={<Send className="w-4 h-4" />}
                      className="bg-white text-indigo-900 hover:bg-slate-100"
                    >
                      {lang === 'ar' ? 'فتح المساعد الذكي لمتابعة المعلقات 🤖' : 'Ask AI Assistant to Follow Up 🤖'}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Bar */}
          <div className="p-4 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>
                {lang === 'ar'
                  ? 'تم حفظ التقرير اليومي وتزامن البيانات محلياً'
                  : 'Daily report saved and synced locally'}
              </span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <Button size="sm" variant="outline" onClick={handleDownloadReport} icon={<Download className="w-4 h-4 text-indigo-500" />}>
                {lang === 'ar' ? 'تنزيل التقرير المنسق (TXT)' : 'Download Report (TXT)'}
              </Button>
              <Button size="sm" variant="outline" onClick={handleCopyReport}>
                {lang === 'ar' ? 'نسخ النص' : 'Copy Text'}
              </Button>
              <Button size="sm" variant="primary" onClick={onClose}>
                {lang === 'ar' ? 'إغلاق التقرير' : 'Close Report'}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
