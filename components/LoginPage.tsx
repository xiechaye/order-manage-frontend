import React, { useState, useEffect } from 'react';
import { User, Lock, Gem } from 'lucide-react';
import { login } from '../services/api';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Clear any existing (potentially invalid) token when entering login page
  useEffect(() => {
    localStorage.removeItem('token');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('请输入用户名和密码');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await login({ username, password });
      if (res.code === 200 && res.data) {
        // Defensive coding: Handle if data is string or object (wrapper)
        let tokenStr = '';
        const tokenData = res.data as any;

        if (typeof tokenData === 'string') {
          tokenStr = tokenData;
        } else if (typeof tokenData === 'object' && tokenData !== null) {
          // If backend returns an object (e.g. SaTokenInfo), try to get tokenValue
          tokenStr = tokenData.tokenValue || tokenData.token || '';
        }

        if (tokenStr && tokenStr !== '[object Object]') {
          localStorage.setItem('token', tokenStr);
          onLoginSuccess();
        } else {
          console.error('Invalid token format received:', tokenData);
          setError('登录失败：服务器返回的Token格式无效');
        }
      } else {
        setError(res.message || '登录失败');
      }
    } catch (err) {
      console.error(err);
      setError('网络错误或服务器异常');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-primary p-6 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
             <Gem className="text-yellow-400 drop-shadow-sm" size={36} fill="currentColor" />
          </div>
          <h2 className="text-2xl font-bold text-white">金砖特价</h2>
          <p className="text-blue-100 mt-2">订单管理系统</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-red-600 rounded-full flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">用户名</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10 block w-full border-gray-300 rounded-lg focus:ring-primary focus:border-primary sm:text-sm px-3 py-2 border"
                  placeholder="请输入用户名"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 block w-full border-gray-300 rounded-lg focus:ring-primary focus:border-primary sm:text-sm px-3 py-2 border"
                  placeholder="请输入密码"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? '登录中...' : '登录'}
          </button>
        </form>
        
        <div className="bg-gray-50 px-8 py-4 text-center text-xs text-gray-500">
          © 2024 金砖特价 System. All rights reserved.
        </div>
      </div>
    </div>
  );
};