import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export function useAuthStore() {
  const context = useContext(AuthContext);
  return context;
}
