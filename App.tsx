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
            if (res.code === 401) {
                localStorage.removeItem('token');
                setToken(null);
            }
          }
        } catch (error: any) {
           console.error("Failed to fetch user info", error);
           // Fix: If the server returns 400 (Bad Request), 401 (Unauthorized), or 403 (Forbidden),
           // it means the token is likely invalid or malformed. We should clear it to allow re-login.
           if (error.response && (error.response.status === 400 || error.response.status === 401 || error.response.status === 403)) {
             localStorage.removeItem('token');
             setToken(null);
             setUser(null);
           }
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const handleLoginSuccess = async () => {
    const storedToken = localStorage.getItem('token');
    setToken(storedToken);
    setCurrentPath('home');
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
      setCurrentPath('home');
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