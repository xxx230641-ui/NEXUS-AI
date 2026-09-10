export const formatGregorianDate = (dateInput: string | number | Date, lang: string = 'ar'): string => {
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);
    return d.toLocaleDateString(lang === 'ar' ? 'ar-EG-u-ca-gregory' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch (e) {
    return String(dateInput);
  }
};

export const formatGregorianDateTime = (dateInput: string | number | Date, lang: string = 'ar'): string => {
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);
    return d.toLocaleString(lang === 'ar' ? 'ar-EG-u-ca-gregory' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (e) {
    return String(dateInput);
  }
};

export interface CalendarDay {
  date: Date;
  gregorianDay: number;
  hijriDayString: string;
  isToday: boolean;
  isCurrentMonth?: boolean;
}

export const getMonthDays = (year: number, month: number, lang: string = 'ar'): CalendarDay[] => {
  const today = new Date();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();

  const days: CalendarDay[] = [];

  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(year, month, i);
    let hijriDayString = `${i}`;
    try {
      hijriDayString = d.toLocaleDateString('ar-SA-u-ca-islamic-uma', { day: 'numeric' });
    } catch (e) {
      hijriDayString = `${i}`;
    }

    days.push({
      date: d,
      gregorianDay: i,
      hijriDayString,
      isToday: d.toDateString() === today.toDateString(),
      isCurrentMonth: true,
    });
  }

  return days;
};

export const getDualDateString = (lang: string = 'ar', dateInput?: Date) => {
  const d = dateInput || new Date();
  const gregorian = d.toLocaleDateString(lang === 'ar' ? 'ar-EG-u-ca-gregory' : 'en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  let hijri = '';
  try {
    hijri = d.toLocaleDateString('ar-SA-u-ca-islamic-uma', {
      day: 'numeric',
      month: 'short',
    });
  } catch (e) {
    hijri = 'هجري';
  }
  return { gregorian, hijri, combined: `${gregorian} - ${hijri}` };
};
