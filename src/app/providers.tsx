import React from 'react';
import { ErrorProvider } from '../context/ErrorContext';

interface ProvidersProps {
  children: React.ReactNode;
}

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <ErrorProvider>
      {children}
    </ErrorProvider>
  );
};
