import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export function useAuthStore() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthStore must be used within an AuthProvider');
  }
  return context;
}
