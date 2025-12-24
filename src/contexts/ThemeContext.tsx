import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check localStorage first, then default to dark mode
    const saved = localStorage.getItem('theme') as Theme | null;
    return saved || 'dark';
  });
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(
    () => {
      if (theme === 'system') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      return theme as 'light' | 'dark';
    }
  );

  // Update document class and localStorage whenever theme changes
  useEffect(() => {
    let effectiveTheme: 'light' | 'dark';
    if (theme === 'system') {
      effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } else {
      effectiveTheme = theme;
    }
    setResolvedTheme(effectiveTheme);
    const root = document.documentElement;
    root.classList.remove('light-mode', 'dark-mode');
    root.classList.add(effectiveTheme === 'light' ? 'light-mode' : 'dark-mode');
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Listen to system theme changes if theme is 'system'
  useEffect(() => {
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      setResolvedTheme(mq.matches ? 'dark' : 'light');
      const root = document.documentElement;
      root.classList.remove('light-mode', 'dark-mode');
      root.classList.add(mq.matches ? 'dark-mode' : 'light-mode');
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
