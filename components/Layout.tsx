import React, { useState } from 'react';
import { LayoutDashboard, Users, LogOut, Menu, User, Home, Gem } from 'lucide-react';
import { AdminUser } from '../types';
import { getImageUrl } from '../services/api';
import { ConfirmDialog } from './ConfirmDialog';

interface LayoutProps {
  user: AdminUser | null;
  currentPath: string;
  onNavigate: (path: string) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ user, currentPath, onNavigate, onLogout, children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  const NavItem = ({ path, icon: Icon, label }: { path: string, icon: any, label: string }) => {
    const isActive = currentPath === path;
    return (
      <button
        onClick={() => {
          onNavigate(path);
          setIsMobileMenuOpen(false);
        }}
        className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
          isActive 
            ? 'bg-primary/10 text-primary border-r-4 border-primary' 
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        }`}
      >
        <Icon size={20} />
        {label}
      </button>
    );
  };

  const handleLogoutClick = () => {
    setIsLogoutConfirmOpen(true);
  };

  const handleConfirmLogout = () => {
    setIsLogoutConfirmOpen(false);
    onLogout();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-lg lg:shadow-none border-r border-gray-200 transform transition-transform duration-200 ease-in-out ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
           <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center text-white mr-3 shadow-sm">
             <Gem size={20} fill="currentColor" className="text-white" />
           </div>
           <span className="text-xl font-bold text-gray-800 tracking-tight">金砖特价</span>
        </div>
        
        <div className="flex flex-col justify-between h-[calc(100vh-4rem)]">
          <nav className="mt-6 space-y-1">
            <NavItem path="home" icon={Home} label="首页" />
            <NavItem path="orders" icon={LayoutDashboard} label="订单管理" />
            <NavItem path="admins" icon={Users} label="管理员管理" />
          </nav>

          <div className="p-4 border-t border-gray-200">
             <div className="flex items-center gap-3 mb-4 px-2">
               <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 overflow-hidden border border-gray-200">
                 {user?.avatar ? (
                   <img src={getImageUrl(user.avatar)} alt="Avatar" className="w-full h-full object-cover" />
                 ) : (
                   <User size={20} />
                 )}
               </div>
               <div className="overflow-hidden">
                 <div className="text-sm font-medium text-gray-900 truncate">{user?.nickname || 'Admin'}</div>
                 <div className="text-xs text-gray-500 truncate">{user?.username}</div>
               </div>
             </div>
             <button
               onClick={handleLogoutClick}
               className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
             >
               <LogOut size={16} />
               退出登录
             </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white shadow-sm border-b border-gray-200 flex items-center justify-between px-4 h-16">
           <div className="flex items-center">
             <button onClick={() => setIsMobileMenuOpen(true)} className="text-gray-500 hover:text-gray-700">
               <Menu size={24} />
             </button>
             <span className="ml-3 text-lg font-semibold text-gray-900">
               {currentPath === 'home' ? '首页' : currentPath === 'orders' ? '订单管理' : '管理员管理'}
             </span>
           </div>
        </header>

        {/* Desktop Header / Breadcrumb area could go here */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
           <div className="max-w-7xl mx-auto">
             <h1 className="text-2xl font-bold text-gray-900 mb-6 hidden lg:block">
                {currentPath === 'home' ? '首页' : currentPath === 'orders' ? '订单管理' : '管理员管理'}
             </h1>
             {children}
           </div>
        </main>
      </div>

      <ConfirmDialog
        isOpen={isLogoutConfirmOpen}
        title="确认退出"
        message="您确定要退出登录吗？"
        confirmText="退出"
        onConfirm={handleConfirmLogout}
        onCancel={() => setIsLogoutConfirmOpen(false)}
      />
    </div>
  );
};