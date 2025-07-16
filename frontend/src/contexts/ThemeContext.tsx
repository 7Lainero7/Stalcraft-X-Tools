import { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  toggleTheme: () => void;
  mode: ThemeMode;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setMode] = useState<ThemeMode>('light');
  
  const toggleTheme = () => {
    setMode(prev => prev === 'light' ? 'dark' : 'light');
  };

  const theme = useMemo(() => createTheme({
    palette: {
      mode,
      primary: {
        main: '#556cd6',
      },
      secondary: {
        main: '#19857b',
      },
    },
  }), [mode]);

  return (
    <ThemeContext.Provider value={{ toggleTheme, mode }}>
      <MuiThemeProvider theme={theme}>
        {children}
      </MuiThemeProvider>
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
