import React, { useState, useEffect } from 'react';
import { OrderManager } from './components/OrderManager';
import { AdminManager } from './components/AdminManager';
import { HomePage } from './components/HomePage';
import { LoginPage } from './components/LoginPage';
import { Layout } from './components/Layout';
import { getUserInfo, logout } from './services/api';
import { AdminUser } from './types';
import { Gem, LogIn } from 'lucide-react';

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
    setCurrentPath('home'); // Redirect to dashboard home after login
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

  // Public/Guest View Routing
  if (!token) {
    if (currentPath === 'login') {
      return <LoginPage onLoginSuccess={handleLoginSuccess} />;
    }

    // Default Public Layout (Home Page)
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Public Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center text-white shadow-sm">
                   <Gem size={20} fill="currentColor" className="text-white" />
                 </div>
                 <span className="text-xl font-bold text-gray-900 tracking-tight">金砖特价</span>
              </div>
              <button
                onClick={() => setCurrentPath('login')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
              >
                <LogIn size={16} className="mr-2" />
                后台登录
              </button>
            </div>
          </div>
        </header>

        {/* Public Main Content */}
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
          <HomePage />
        </main>
        
        {/* Simple Footer */}
        <footer className="bg-white border-t border-gray-200 mt-auto">
          <div className="max-w-7xl mx-auto py-6 px-4 overflow-hidden sm:px-6 lg:px-8">
            <p className="text-center text-base text-gray-400">
              &copy; 2024 金砖特价 System. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    );
  }

  // Authenticated View Routing
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