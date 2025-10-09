import React from 'react';
import { ChatAppProvider } from './src/Context/ChatAppContext';
import AppNavigator from "./src/navigation/AppNavigator";
import { ThemeProvider } from './src/Context/ThemeContext';

const App = () => {
  return (
    <ThemeProvider>
      <ChatAppProvider>
        <AppNavigator />
      </ChatAppProvider>
    </ThemeProvider>
  );
};

export default App;
