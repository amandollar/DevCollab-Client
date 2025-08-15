import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { tokenStorage } from '@/lib/auth';

export const useAuthPersistence = () => {
  const { user, setUser } = useAuth();

  useEffect(() => {
    // Check if user is logged in on app start
    const token = tokenStorage.getToken();
    if (token && !user) {
      // Token exists but no user, try to fetch user data
      // This will be handled by the AuthContext useEffect
    }
  }, [user]);

  return { user, setUser };
};
