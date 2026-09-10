import React, { createContext, useContext, useState, useEffect } from 'react';

export type Theme = 'light' | 'dark';
export type AccentColor = 'indigo' | 'emerald' | 'violet' | 'amber' | 'rose' | 'cyan';
export type BgPattern =
  | 'arabesque'
  | 'oriental_stars'
  | 'dots'
  | 'waves'
  | 'silk_waves'
  | 'grid'
  | 'cyber'
  | 'hexagons'
  | 'circuit'
  | 'mandala'
  | 'none';

export const BG_PATTERNS: Record<BgPattern, { nameAr: string; nameEn: string; descAr: string; descEn: string }> = {
  arabesque: {
    nameAr: 'زخرفة إسلامية ملكية',
    nameEn: 'Royal Arabesque Stars',
    descAr: 'نقوش هندسية إسلامية نجمية دقيقة وفخمة',
    descEn: 'Intricate royal geometric Islamic star patterns',
  },
  oriental_stars: {
    nameAr: 'نجوم أندلسية راقية',
    nameEn: 'Andalusian Star Geometry',
    descAr: 'نقوش وزخارف هندسية مستوحاة من العمارة الأندلسية',
    descEn: 'Elegant geometry inspired by Andalusian architecture',
  },
  dots: {
    nameAr: 'شبكة نقاط كلاسيكية',
    nameEn: 'Glow Dots Matrix',
    descAr: 'مصفوفة من النقاط الأنيقة الهادئة ذات التوازن البصري',
    descEn: 'Minimalist subtle glowing dot matrix grid',
  },
  waves: {
    nameAr: 'أمواج هندسية حديثة',
    nameEn: 'Modern Wave Mesh',
    descAr: 'تدرجات وأمواج شبكية جذابة تمنح شعوراً بالحركة',
    descEn: 'Subtle dynamic wave mesh gradients',
  },
  silk_waves: {
    nameAr: 'حرير أورورا الانسيابي',
    nameEn: 'Aurora Flow Silk',
    descAr: 'أمواج حريرية انسيابية متداخلة مستوحاة من الشفق القطبي',
    descEn: 'Fluid smooth aurora wavy line art gradients',
  },
  grid: {
    nameAr: 'مربعات وهندسة تقنية',
    nameEn: 'Tech Grid Blueprint',
    descAr: 'خطوط هندسية متقاطعة بأسلوب تصميم الأنظمة التقنية',
    descEn: 'Clean architectural tech grid layout',
  },
  cyber: {
    nameAr: 'شبكة سيبرانية متوهجة',
    nameEn: 'Cyber Neon Pulse',
    descAr: 'خطوط تقنية متوهجة مع نقاط تقاطع تفاعلية جذابة',
    descEn: 'Futuristic glowing cyber grid with crosshair nodes',
  },
  hexagons: {
    nameAr: 'خلايا مزخرفة فخمة',
    nameEn: 'Luxury Hexagon Mosaic',
    descAr: 'نمط الخلايا السداسية الذهبية المبتكرة والعصرية',
    descEn: 'Patterned hexagonal mesh mosaic design',
  },
  circuit: {
    nameAr: 'دوائر رقمية فائقة',
    nameEn: 'Neural Circuit Matrix',
    descAr: 'مسارات لوحات رقمية وذكاء اصطناعي حديثة',
    descEn: 'Modern neural microchip circuit lines & nodes',
  },
  mandala: {
    nameAr: 'ماندالا كونية جذابة',
    nameEn: 'Cosmic Mandala Rings',
    descAr: 'دوائر ونقوش دائرية هندسية ساحرة ولطيفة',
    descEn: 'Symmetrical cosmic mandala geometry',
  },
  none: {
    nameAr: 'بدون زخرفة (سادة)',
    nameEn: 'Solid / Minimal',
    descAr: 'خلفية سادة هادئة بدون أي نقوش أو زخارف',
    descEn: 'Clean plain background without patterns',
  },
};

export const ACCENT_PALETTES: Record<AccentColor, { nameAr: string; nameEn: string; lightHex: string; darkHex: string; hoverLight: string; hoverDark: string }> = {
  indigo: {
    nameAr: 'نيلي (افتراضي)',
    nameEn: 'Indigo (Default)',
    lightHex: '#6366F1',
    darkHex: '#818CF8',
    hoverLight: '#4F46E5',
    hoverDark: '#A5B4FC',
  },
  emerald: {
    nameAr: 'زمردي',
    nameEn: 'Emerald',
    lightHex: '#10B981',
    darkHex: '#34D399',
    hoverLight: '#059669',
    hoverDark: '#6EE7B7',
  },
  violet: {
    nameAr: 'بنفسجي',
    nameEn: 'Violet',
    lightHex: '#8B5CF6',
    darkHex: '#A78BFA',
    hoverLight: '#7C3AED',
    hoverDark: '#C4B5FD',
  },
  amber: {
    nameAr: 'عنبري',
    nameEn: 'Amber',
    lightHex: '#F59E0B',
    darkHex: '#FBBF24',
    hoverLight: '#D97706',
    hoverDark: '#FDE68A',
  },
  rose: {
    nameAr: 'وردي',
    nameEn: 'Rose',
    lightHex: '#F43F5E',
    darkHex: '#FB7185',
    hoverLight: '#E11D48',
    hoverDark: '#FDA4AF',
  },
  cyan: {
    nameAr: 'سماوي',
    nameEn: 'Cyan',
    lightHex: '#06B6D4',
    darkHex: '#22D3EE',
    hoverLight: '#0891B2',
    hoverDark: '#67E8F9',
  },
};

interface ThemeContextType {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
  accent: AccentColor;
  setAccent: (a: AccentColor) => void;
  bgPattern: BgPattern;
  setBgPattern: (p: BgPattern) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nexus_theme') as Theme;
      if (saved === 'light' || saved === 'dark') return saved;
    }
    return 'light';
  });

  const [accent, setAccentState] = useState<AccentColor>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nexus_accent') as AccentColor;
      if (saved && ACCENT_PALETTES[saved]) return saved;
    }
    return 'indigo';
  });

  const [bgPattern, setBgPatternState] = useState<BgPattern>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nexus_bg_pattern') as BgPattern;
      if (saved && BG_PATTERNS[saved]) return saved;
    }
    return 'arabesque';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('nexus_theme', theme);
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    const palette = ACCENT_PALETTES[accent] || ACCENT_PALETTES.indigo;
    const isDark = theme === 'dark';

    const currentAccent = isDark ? palette.darkHex : palette.lightHex;
    const currentHover = isDark ? palette.hoverDark : palette.hoverLight;

    root.style.setProperty('--accent', currentAccent);
    root.style.setProperty('--accent-hover', currentHover);
    root.style.setProperty('--border-focus', currentAccent);

    if (typeof window !== 'undefined') {
      localStorage.setItem('nexus_accent', accent);
    }
  }, [accent, theme]);

  useEffect(() => {
    const body = document.body;
    (Object.keys(BG_PATTERNS) as BgPattern[]).forEach((key) => {
      body.classList.remove(`bg-pattern-${key}`);
    });
    body.classList.add(`bg-pattern-${bgPattern}`);

    if (typeof window !== 'undefined') {
      localStorage.setItem('nexus_bg_pattern', bgPattern);
    }
  }, [bgPattern]);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const setTheme = (t: Theme) => {
    setThemeState(t);
  };

  const setAccent = (a: AccentColor) => {
    setAccentState(a);
  };

  const setBgPattern = (p: BgPattern) => {
    setBgPatternState(p);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, accent, setAccent, bgPattern, setBgPattern }}>
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}


