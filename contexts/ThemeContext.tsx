import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeColors {
  // Background colors
  background: string;
  surface: string;
  card: string;
  
  // Text colors
  text: string;
  textSecondary: string;
  textTertiary: string;
  
  // Interactive elements
  primary: string;
  primaryText: string;
  secondary: string;
  secondaryText: string;
  
  // Borders and dividers
  border: string;
  divider: string;
  
  // Status colors
  success: string;
  error: string;
  warning: string;
  
  // Overlay
  overlay: string;
}

interface ThemeContextType {
  theme: ThemeColors;
  themeMode: ThemeMode;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
}

const lightTheme: ThemeColors = {
  background: '#FDFDFC',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  text: '#37352F',
  textSecondary: '#787774',
  textTertiary: '#9B9A97',
  primary: '#5F6B52',
  primaryText: '#FFFFFF',
  secondary: '#F7F6F3',
  secondaryText: '#37352F',
  border: '#E3E2E0',
  divider: '#F1F1EF',
  success: '#4A7C59',
  error: '#C14A4A',
  warning: '#B8860B',
  overlay: 'rgba(55, 53, 47, 0.3)',
};

const darkTheme: ThemeColors = {
  background: '#191919',
  surface: '#2F2F2F',
  card: '#3A3A3A',
  text: '#E8E6E3',
  textSecondary: '#B8B5B2',
  textTertiary: '#8A8A8A',
  primary: '#7A8B6B',
  primaryText: '#191919',
  secondary: '#3A3A3A',
  secondaryText: '#E8E6E3',
  border: '#4A4A4A',
  divider: '#3A3A3A',
  success: '#6B8E7B',
  error: '#D15A5A',
  warning: '#D4A017',
  overlay: 'rgba(25, 25, 25, 0.7)',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const colorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');
  const [theme, setTheme] = useState<ThemeColors>(lightTheme);

  // Determine the theme based on themeMode and system preference
  const getActualTheme = (): 'light' | 'dark' => {
    if (themeMode === 'system') {
      return colorScheme || 'light';
    }
    return themeMode;
  };

  useEffect(() => {
    const actualTheme = getActualTheme();
    setTheme(actualTheme === 'light' ? lightTheme : darkTheme);
  }, [themeMode, colorScheme]);

  const toggleTheme = () => {
    if (themeMode === 'system') {
      setThemeMode('light');
    } else if (themeMode === 'light') {
      setThemeMode('dark');
    } else {
      setThemeMode('system');
    }
  };

  const value: ThemeContextType = {
    theme,
    themeMode,
    toggleTheme,
    setThemeMode,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}; 