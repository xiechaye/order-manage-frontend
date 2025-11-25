
import React, { useState, useEffect } from 'react';
import { OrderManager } from './components/OrderManager';
import { AdminManager } from './components/AdminManager';
import { HomePage } from './components/HomePage';
import { LoginPage } from './components/LoginPage';
import { Layout } from './components/Layout';
import { getUserInfo, logout } from './services/api';
import { AdminUser } from './types';

function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<AdminUser | null>(null);
  const [currentPath, setCurrentPath] = useState<string>('home');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Handle unauthorized events (401) from API interceptor
    const handleUnauthorized = () => {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await getUserInfo();
          if (res.code === 200 && res.data) {
            setUser(res.data);
          } else {
            // Only clear token if it's explicitly an auth error (handled mostly by interceptor)
            // If code is not 200 but not 401, we generally don't logout immediately
            if (res.code === 401) {
                localStorage.removeItem('token');
                setToken(null);
            }
          }
        } catch (error) {
           console.error("Failed to fetch user info", error);
           // IMPORTANT: Do NOT clear token here on generic errors (like Network Error)
           // If we clear token here, a simple network glitch logs the user out immediately.
           // The 'auth:unauthorized' event listener handles 401s specifically.
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const handleLoginSuccess = async () => {
    const storedToken = localStorage.getItem('token');
    setToken(storedToken);
    // User info will be fetched by the effect
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {
      console.error(e);
    } finally {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!token) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  const renderContent = () => {
    switch (currentPath) {
      case 'home':
        return <HomePage />;
      case 'orders':
        return <OrderManager />;
      case 'admins':
        return <AdminManager />;
      default:
        return <HomePage />;
    }
  };

  return (
    <Layout 
      user={user} 
      currentPath={currentPath} 
      onNavigate={setCurrentPath} 
      onLogout={handleLogout}
    >
      {renderContent()}
    </Layout>
  );
}

export default App;
