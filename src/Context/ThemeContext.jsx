import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const deviceTheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(deviceTheme === 'dark');

  useEffect(() => {
    setIsDarkMode(deviceTheme === 'dark');
  }, [deviceTheme]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const theme = {
    isDarkMode,
    toggleTheme,
    colors: isDarkMode ? {
      background: '#121212', // Deep, soft black
      surface: '#1F1F1F', // Slightly lighter, muted grey for cards/elements
      primary: '#007BFF', // Modern, clean blue
      secondary: '#17A2B8', // Vibrant teal
      text: '#E0E0E0', // Soft white
      textSecondary: '#A0A0A0', // Lighter grey for secondary text
      border: '#3A3A3A', // Subtle dark grey for borders
      buttonBackground: '#007BFF', // Primary color for buttons
      buttonText: '#FFFFFF', // White text on buttons
      error: '#DC3545', // Standard red for errors
      activeBackground: 'rgba(0, 123, 255, 0.2)', // Muted transparent blue for active navbar item
      hoverBackground: 'rgba(0, 123, 255, 0.1)', // Subtle transparent blue for hover
    } : {
      background: '#F8F9FA', // Very light grey background
      surface: '#FFFFFF', // Pure white surface for cards/elements
      primary: '#007BFF', // Modern, clean blue
      secondary: '#17A2B8', // Vibrant teal
      text: '#343A40', // Dark charcoal
      textSecondary: '#6C757D', // Medium grey for secondary text
      border: '#E9ECEF', // Light, subtle grey for borders
      buttonBackground: '#007BFF', // Primary color for buttons
      buttonText: '#FFFFFF', // White text on buttons
      error: '#DC3545', // Standard red for errors
      activeBackground: 'rgba(0, 123, 255, 0.1)', // Very light transparent blue for active navbar item
      hoverBackground: 'rgba(0, 123, 255, 0.05)', // Even lighter transparent blue for hover
    }
  };

  return (
    <ThemeContext.Provider value={theme}>
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