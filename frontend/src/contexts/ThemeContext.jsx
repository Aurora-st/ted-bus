import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // Get from localStorage or default to light
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'light';
  });

  // Apply theme to document
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);

    // Update in database if user is authenticated
    // Check if token exists
    const token = localStorage.getItem('token');
    if (token) {
      try {
        await axios.put('/api/users/theme', { theme: newTheme });
      } catch (error) {
        console.error('Failed to update theme preference:', error);
      }
    }
  };

  // Sync theme from user data when available
  const syncTheme = (userTheme) => {
    if (userTheme && userTheme !== theme) {
      setTheme(userTheme);
      localStorage.setItem('theme', userTheme);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, syncTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
