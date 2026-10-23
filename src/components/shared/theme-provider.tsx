'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type AppTheme = 'light' | 'midnight' | 'executive';

interface ThemeContextType {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<AppTheme>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('calendio-theme') as AppTheme;
    if (saved && (saved === 'light' || saved === 'midnight' || saved === 'executive')) {
      setTheme(saved);
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    root.classList.remove('light', 'dark', 'midnight', 'executive');

    if (theme === 'light') {
      root.classList.add('light');
    } else if (theme === 'midnight') {
      root.classList.add('dark', 'midnight');
    } else if (theme === 'executive') {
      root.classList.add('dark', 'executive');
    }

    localStorage.setItem('calendio-theme', theme);
  }, [theme, mounted]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useAppTheme = () => useContext(ThemeContext);
