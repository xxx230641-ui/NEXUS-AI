import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, Plus, Sparkles, Globe, Maximize2, Minimize2 } from 'lucide-react';
import { useLang } from '../../hooks/useLang';
import { getDualDateString, getMonthDays, CalendarDay } from '../../utils/dateUtils';
import { Card } from './Card';

interface CalendarEvent {
  id: string;
  titleAr: string;
  titleEn: string;
  time: string;
  context: string;
  source: string;
}

interface DualCalendarWidgetProps {
  onOpenReport?: () => void;
}

export const DualCalendarWidget: React.FC<DualCalendarWidgetProps> = ({ onOpenReport }) => {
  const { lang } = useLang();
  const today = new Date();

  const [currentDate, setCurrentDate] = useState<Date>(today);
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [newEventTitle, setNewEventTitle] = useState<string>('');
  const [showAddEvent, setShowAddEvent] = useState<boolean>(false);

  // Synced Events
  const [events, setEvents] = useState<CalendarEvent[]>([
    {
      id: 'e1',
      titleAr: 'اجتماع مراجعة استراتيجية التسويق 🚀',
      titleEn: 'Marketing Strategy Sync Meeting 🚀',
      time: '10:00 AM',
      context: 'professional',
      source: 'Google Calendar',
    },
    {
      id: 'e2',
      titleAr: 'غداء عمل مع فريق التطوير 🍱',
      titleEn: 'Team Business Lunch 🍱',
      time: '01:30 PM',
      context: 'professional',
      source: 'Google Calendar',
    },
    {
      id: 'e3',
      titleAr: 'جلسة رياضية عائلية 🏃‍♂️',
      titleEn: 'Family Fitness Session 🏃‍♂️',
      time: '06:00 PM',
      context: 'family',
      source: 'Personal Reminders',
    },
  ]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const days = getMonthDays(year, month, lang);
  const dualDates = getDualDateString(lang, currentDate);

  const monthNameGregorian = new Intl.DateTimeFormat(lang === 'ar' ? 'ar-EG' : 'en-US', {
    month: 'long',
    year: 'numeric',
  }).format(currentDate);

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const jumpToToday = () => {
    setCurrentDate(today);
  };

  const handleAddEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;
    const newEv: CalendarEvent = {
      id: 'e_' + Date.now(),
      titleAr: newEventTitle.trim(),
      titleEn: newEventTitle.trim(),
      time: '02:00 PM',
      context: 'professional',
      source: 'NEXUS Direct',
    };
    setEvents([newEv, ...events]);
    setNewEventTitle('');
    setShowAddEvent(false);
  };

  const weekdaysAr = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const weekdaysEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weekdays = lang === 'ar' ? weekdaysAr : weekdaysEn;

  // Calculate 7-day current week for Compact View
  const todayIndex = days.findIndex((d) => d.isToday);
  const weekStartIndex = todayIndex !== -1 ? Math.floor(todayIndex / 7) * 7 : 0;
  const currentWeekDays = days.slice(weekStartIndex, weekStartIndex + 7);

  return (
    <Card className="p-3.5 sm:p-5 space-y-3.5 border-2 border-[var(--border-subtle)] bg-[var(--bg-surface)] rounded-3xl shadow-xl transition-all">
      {/* Widget Header & Date Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-[var(--text-primary)] flex items-center gap-2">
                <span>{lang === 'ar' ? 'التقويم التفاعلي (مزدوج)' : 'Dual Interactive Calendar'}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30">
                  {lang === 'ar' ? 'ميلادي + هجري 📅' : 'Gregorian + Hijri 📅'}
                </span>
              </h3>
            </div>
          </div>
          {/* Dual Date Subtitle */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-[var(--text-secondary)] pt-0.5">
            <span className="px-2 py-0.5 rounded-lg bg-[var(--bg-hover)] border border-[var(--border-subtle)] text-[var(--accent)] font-mono text-[11px]">
              📅 {dualDates.gregorian}
            </span>
            <span className="text-[var(--text-muted)]">/</span>
            <span className="px-2 py-0.5 rounded-lg bg-[var(--bg-hover)] border border-[var(--border-subtle)] text-emerald-600 dark:text-emerald-400 font-mono text-[11px]">
              ☪️ {dualDates.hijri}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <button
            onClick={jumpToToday}
            className="px-2.5 py-1 rounded-xl bg-[var(--bg-hover)] hover:bg-[var(--accent)] hover:text-white text-[var(--text-primary)] font-bold text-xs border border-[var(--border-subtle)] transition-all cursor-pointer"
          >
            {lang === 'ar' ? 'اليوم' : 'Today'}
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 px-3 py-1 rounded-xl bg-[var(--accent)]/15 hover:bg-[var(--accent)] hover:text-white text-[var(--accent)] font-extrabold text-xs border border-[var(--accent)]/30 transition-all cursor-pointer"
          >
            {isExpanded ? (
              <>
                <Minimize2 className="w-3.5 h-3.5" />
                <span>{lang === 'ar' ? 'عرض مدمج' : 'Compact View'}</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5" />
                <span>{lang === 'ar' ? 'توسيع التقويم' : 'Expand Month'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* COMPACT VIEW (7-DAY WEEK STRIP + AGENDA) */}
      {!isExpanded ? (
        <div className="space-y-3">
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {currentWeekDays.map((cell, idx) => {
              const isSelected = selectedDay?.date.toDateString() === cell.date.toDateString();
              const dayNameShort = weekdays[cell.date.getDay()];

              return (
                <button
                  key={idx}
                  onClick={() => setSelectedDay(cell)}
                  className={`
                    p-2 rounded-2xl border transition-all cursor-pointer flex flex-col items-center justify-center space-y-0.5 text-center
                    ${
                      cell.isToday
                        ? 'bg-[var(--accent)] text-white border-[var(--accent)] shadow-md ring-2 ring-[var(--accent)]/30 font-black'
                        : isSelected
                        ? 'bg-[var(--bg-hover)] border-[var(--accent)] ring-1 ring-[var(--accent)]'
                        : 'bg-[var(--bg-base)] border-[var(--border-subtle)] hover:border-[var(--accent)]/50 hover:bg-[var(--bg-hover)] text-[var(--text-primary)]'
                    }
                  `}
                >
                  <span className={`text-[10px] uppercase font-extrabold ${cell.isToday ? 'text-white/80' : 'text-[var(--text-muted)]'}`}>
                    {dayNameShort}
                  </span>
                  <span className={`text-sm sm:text-base font-black ${cell.isToday ? 'text-white' : 'text-[var(--text-primary)]'}`}>
                    {cell.gregorianDay}
                  </span>
                  <span
                    className={`text-[9px] font-bold font-mono px-1 rounded-md ${
                      cell.isToday ? 'bg-white/20 text-white' : 'text-amber-600 dark:text-amber-400 bg-amber-500/10'
                    }`}
                  >
                    {cell.hijriDayString}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Compact Agenda Row */}
          <div className="p-3 rounded-2xl bg-[var(--bg-base)] border border-[var(--border-subtle)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
              <Clock className="w-4 h-4 text-[var(--accent)] shrink-0" />
              <span className="font-extrabold text-[var(--text-primary)] shrink-0">
                {selectedDay
                  ? lang === 'ar'
                    ? `أحداث يوم ${selectedDay.gregorianDay}:`
                    : `Day ${selectedDay.gregorianDay} Events:`
                  : lang === 'ar'
                  ? 'أحداث اليوم:'
                  : 'Today\'s Events:'}
              </span>

              <div className="flex items-center gap-2 overflow-x-auto">
                {events.slice(0, 2).map((ev) => (
                  <span
                    key={ev.id}
                    className="px-2.5 py-1 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[11px] font-bold text-[var(--text-primary)] shrink-0 flex items-center gap-1.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
                    <span className="truncate max-w-[140px]">{lang === 'ar' ? ev.titleAr : ev.titleEn}</span>
                    <span className="text-[9px] text-[var(--text-muted)] font-mono">({ev.time})</span>
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
              <button
                onClick={() => setShowAddEvent(!showAddEvent)}
                className="px-2.5 py-1 rounded-xl bg-[var(--accent)] text-white hover:opacity-90 transition-all font-bold text-xs flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{lang === 'ar' ? 'إضافة موعد' : 'Add Event'}</span>
              </button>

              {onOpenReport && (
                <button
                  onClick={onOpenReport}
                  className="px-2.5 py-1 rounded-xl bg-purple-600 text-white hover:opacity-90 transition-all font-bold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{lang === 'ar' ? 'التقرير' : 'Report'}</span>
                </button>
              )}
            </div>
          </div>

          {showAddEvent && (
            <form onSubmit={handleAddEventSubmit} className="space-y-2 p-3 bg-[var(--bg-surface)] rounded-2xl border border-[var(--accent)]">
              <input
                type="text"
                placeholder={lang === 'ar' ? 'عنوان الاجتماع أو التذكير...' : 'Event title...'}
                value={newEventTitle}
                onChange={(e) => setNewEventTitle(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-[var(--bg-base)] text-xs text-[var(--text-primary)] border border-[var(--border-subtle)] focus:outline-none"
                autoFocus
              />
              <div className="flex justify-end gap-1">
                <button
                  type="button"
                  onClick={() => setShowAddEvent(false)}
                  className="px-2.5 py-1 rounded-lg text-xs text-[var(--text-muted)] hover:bg-[var(--bg-hover)]"
                >
                  {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button type="submit" className="px-3 py-1 rounded-lg text-xs bg-[var(--accent)] text-white font-bold">
                  {lang === 'ar' ? 'حفظ' : 'Save'}
                </button>
              </div>
            </form>
          )}
        </div>
      ) : (
        /* EXPANDED FULL MONTH GRID */
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2">
            <div className="flex items-center gap-1 bg-[var(--bg-base)] p-1 rounded-xl border border-[var(--border-subtle)]">
              <button
                onClick={prevMonth}
                className="p-1 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-primary)] transition-all cursor-pointer"
              >
                <ChevronRight className="w-4 h-4 rtl:rotate-0 ltr:rotate-180" />
              </button>
              <span className="px-2 text-xs font-black text-[var(--text-primary)] min-w-[110px] text-center">
                {monthNameGregorian}
              </span>
              <button
                onClick={nextMonth}
                className="p-1 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-primary)] transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4 rtl:rotate-0 ltr:rotate-180" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 space-y-2">
              <div className="grid grid-cols-7 text-center gap-1">
                {weekdays.map((dayName, idx) => (
                  <div
                    key={idx}
                    className="py-1 text-[11px] font-black text-[var(--text-muted)] uppercase tracking-wider bg-[var(--bg-base)]/50 rounded-lg border border-[var(--border-subtle)]/50"
                  >
                    {dayName}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {days.map((cell, idx) => {
                  const isSelected = selectedDay?.date.toDateString() === cell.date.toDateString();

                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedDay(cell)}
                      className={`
                        p-2 rounded-2xl border transition-all cursor-pointer flex flex-col items-center justify-between min-h-[50px] text-center group
                        ${
                          cell.isToday
                            ? 'bg-[var(--accent)] text-white border-[var(--accent)] shadow-md font-black'
                            : isSelected
                            ? 'bg-[var(--bg-hover)] border-[var(--accent)]'
                            : cell.isCurrentMonth
                            ? 'bg-[var(--bg-base)] border-[var(--border-subtle)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)]'
                            : 'bg-[var(--bg-surface)]/40 border-transparent text-[var(--text-muted)] opacity-40'
                        }
                      `}
                    >
                      <span className={`text-xs font-black ${cell.isToday ? 'text-white' : 'text-[var(--text-primary)]'}`}>
                        {cell.gregorianDay}
                      </span>
                      <span
                        className={`text-[8px] font-bold font-mono px-1 rounded ${
                          cell.isToday ? 'bg-white/20 text-white' : 'text-amber-600 dark:text-amber-400 bg-amber-500/10'
                        }`}
                      >
                        {cell.hijriDayString}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sidebar Schedule */}
            <div className="space-y-3 bg-[var(--bg-base)] p-3.5 rounded-2xl border border-[var(--border-subtle)]">
              <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2">
                <h4 className="text-xs font-black text-[var(--text-primary)] flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[var(--accent)]" />
                  <span>{selectedDay ? `أحداث يوم ${selectedDay.gregorianDay}` : 'جدول اليوم'}</span>
                </h4>
                <button
                  onClick={() => setShowAddEvent(!showAddEvent)}
                  className="p-1 rounded-lg bg-[var(--accent)] text-white hover:opacity-90 transition-all cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>

              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {events.map((ev) => (
                  <div key={ev.id} className="p-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-0.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[var(--text-primary)]">{lang === 'ar' ? ev.titleAr : ev.titleEn}</span>
                      <span className="text-[10px] font-mono font-bold text-[var(--accent)]">{ev.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};
