import React, { createContext, useContext, useState } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

const defaultTheme = {
  company_name: 'GDB circular',
  logo_url: '/logo.png',
  primary_color: '#981B1F',
  secondary_color: '#C3662D',
};

export const ThemeProvider = ({ children }) => {
  const [theme] = useState(defaultTheme);

  // No-op handlers to prevent breaking calls elsewhere (e.g. Sidebar resetTheme on logout)
  const updateTheme = () => { };
  const resetTheme = () => { };

  return (
    <ThemeContext.Provider value={{ theme, updateTheme, resetTheme, isDefault: true }}>
      {children}
    </ThemeContext.Provider>
  );
};
