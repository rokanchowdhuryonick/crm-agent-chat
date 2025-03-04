// src/App.jsx
'use client';

import { AuthProvider } from './contexts/AuthContext';
import { AppContent } from './AppContent';
import './styles/main.css';

export const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};