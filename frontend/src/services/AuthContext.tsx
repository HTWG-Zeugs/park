import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

interface AuthContextType {
  isAuthenticated: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTHENTICATION_SERVICE_URL = import.meta.env.VITE_AUTHENTICATION_SERVICE_URL;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await axios.post(AUTHENTICATION_SERVICE_URL, {}, { withCredentials: true });

        if (response.status === 200) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error validating auth token:', error);
        setIsAuthenticated(false);
      }
    };

    checkAuthStatus();
  }, []);

  const logout = async () => {
    throw new Error('Not implemented');
    // try {
    //   const response = await fetch('/auth/logout', {
    //     method: 'POST',
    //     credentials: 'include',
    //   });

    //   if (response.ok) {
    //     setIsAuthenticated(false);
    //   } else {
    //     console.error('Failed to log out');
    //   }
    // } catch (error) {
    //   console.error('Error logging out:', error);
    // }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
