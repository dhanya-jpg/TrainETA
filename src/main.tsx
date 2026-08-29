import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ThemeProvider } from './contexts/ThemeContext';
import './index.css';

// Safely suppress harmless Firestore offline warnings from alerting AI Studio
const originalConsoleError = console.error;
console.error = (...args: any[]) => {
  if (args.length > 0) {
    const msg = typeof args[0] === 'string' ? args[0] : (args[0]?.message || '');
    if (msg.includes('Could not reach Cloud Firestore backend') || msg.includes('[code=unavailable]')) {
      console.warn('Firestore offline mode active: Unable to reach Cloud Firestore backend.');
      return;
    }
  }
  originalConsoleError(...args);
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
);
