
import React, { useEffect, useState, useCallback } from 'react';
import dayjs from 'dayjs';
import { 
  Search, Plus, Edit2, Trash2, 
  ChevronLeft, ChevronRight, XCircle, CheckCircle, RotateCcw, UserX, UserCheck
} from 'lucide-react';
import { 
  getAdmins, createAdmin, updateAdmin, deleteAdmin, updateAdminStatus, getImageUrl
} from '../services/api';
import { AdminUser } from '../types';
import { AdminModal } from './AdminModal';
import { ConfirmDialog } from './ConfirmDialog';

const Alert = ({ type, message, onClose }: { type: 'success' | 'error', message: string, onClose: () => void }) => (
  <div className={`fixed top-4 right-4 z-[70] flex items-center p-4 mb-4 text-sm rounded-lg shadow-lg animate-fade-in-down ${
    type === 'success' ? 'text-green-800 bg-green-50' : 'text-red-800 bg-red-50'
  }`} role="alert">
    <span className="font-medium mr-2">{type === 'success' ? '成功！' : '错误！'}</span> {message}
    <button onClick={onClose} className="ml-4 hover:opacity-75">
      <XCircle size={16} />
    </button>
  </div>
);

export const AdminManager: React.FC = () => {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [pagination, setPagination] = useState({ current: 1, size: 10 });
  const [usernameFilter, setUsernameFilter] = useState('');
  
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: 'create' | 'edit';
    selectedAdmin?: AdminUser;
  }>({ isOpen: false, type: 'create' });

  const [deleteConfirmState, setDeleteConfirmState] = useState<{
    isOpen: boolean;
    adminId: string | null;
  }>({ isOpen: false, adminId: null });

  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const loadAdmins = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdmins({
        current: pagination.current,
        size: pagination.size,
        username: usernameFilter || undefined
      });
      
      if (res.code === 200 && res.data) {
        setAdmins(res.data.records);
        setTotal(res.data.total);
      } else {
        showNotification('error', res.message || '获取管理员列表失败');
      }
    } catch (error) {
      showNotification('error', '网络请求失败');
    } finally {
      setLoading(false);
    }
  }, [pagination, usernameFilter]);

  useEffect(() => {
    loadAdmins();
  }, [loadAdmins]);

  const handleSearch = () => {
    setPagination({ ...pagination, current: 1 });
    loadAdmins();
  };

  const handleReset = () => {
    setUsernameFilter('');
    setPagination({ ...pagination, current: 1 });
    // Trigger load in effect when filter changes
  };

  const executeDelete = async () => {
    if (!deleteConfirmState.adminId) return;
    try {
      const res = await deleteAdmin(deleteConfirmState.adminId);
      if (res.code === 200) {
        showNotification('success', '管理员已删除');
        loadAdmins();
      } else {
        showNotification('error', res.message || '删除失败');
      }
    } catch (error) {
      showNotification('error', '删除请求失败');
    } finally {
      setDeleteConfirmState({ isOpen: false, adminId: null });
    }
  };

  const handleStatusToggle = async (admin: AdminUser) => {
    const newStatus = admin.status === 1 ? 0 : 1;
    try {
      const res = await updateAdminStatus(admin.id, newStatus);
      if (res.code === 200) {
        showNotification('success', `状态已更新为${newStatus === 1 ? '启用' : '禁用'}`);
        loadAdmins();
      } else {
        showNotification('error', res.message || '状态更新失败');
      }
    } catch (error) {
      showNotification('error', '状态更新请求失败');
    }
  };

  const handleModalSubmit = async (data: Partial<AdminUser> & { password?: string }) => {
    try {
      let res;
      if (modalState.type === 'create') {
        // Fix: Backend requires createTime/updateTime to be non-null.
        // We provide both camelCase and snake_case to ensure the backend JSON mapper picks it up.
        const now = dayjs().format('YYYY-MM-DD HH:mm:ss');
        const createPayload = {
            ...data,
            createTime: now,
            updateTime: now,
            create_time: now,
            update_time: now,
            deleted: 0
        } as any;
        res = await createAdmin(createPayload);
      } else if (modalState.selectedAdmin) {
        // Only update allowable fields
        const { nickname, avatar, status } = data;
        res = await updateAdmin(modalState.selectedAdmin.id, { nickname, avatar, status });
      }

      if (res && res.code === 200) {
        showNotification('success', modalState.type === 'create' ? '创建成功' : '更新成功');
        loadAdmins();
      } else {
        throw new Error(res?.message || '操作失败');
      }
    } catch (error: any) {
      showNotification('error', error.message || '操作失败');
      throw error;
    }
  };

  return (
    <div className="space-y-6">
      {notification && <Alert type={notification.type} message={notification.message} onClose={() => setNotification(null)} />}
      
      {/* Page Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            value={usernameFilter}
            onChange={(e) => setUsernameFilter(e.target.value)}
            placeholder="搜索用户名"
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-primary focus:border-primary flex-1 sm:w-64"
          />
          <button onClick={handleSearch} className="p-2 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200">
            <Search size={18} />
          </button>
          <button onClick={handleReset} className="p-2 bg-white border border-gray-300 text-gray-600 rounded-md hover:bg-gray-50" title="重置">
            <RotateCcw size={18} />
          </button>
        </div>
        
        <button
          onClick={() => setModalState({ isOpen: true, type: 'create' })}
          className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:opacity-90 transition-all"
        >
          <Plus size={18} className="mr-2" />
          新增管理员
        </button>
      </div>

      {/* Table */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
           <div className="p-12 text-center text-gray-500">
             <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
             加载中...
           </div>
        ) : admins.length === 0 ? (
           <div className="p-12 text-center text-gray-500">暂无管理员数据</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">用户信息</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">创建时间</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {admins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 font-mono">{admin.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm mr-3 overflow-hidden border border-gray-200">
                          {admin.avatar ? (
                            <img src={getImageUrl(admin.avatar)} alt="" className="h-full w-full object-cover" />
                          ) : (
                            admin.nickname.charAt(0)
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{admin.nickname}</div>
                          <div className="text-xs text-gray-500">@{admin.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {admin.status === 1 ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          启用
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          禁用
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{admin.createTime}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setModalState({ isOpen: true, type: 'edit', selectedAdmin: admin })}
                          className="text-blue-600 hover:text-blue-900"
                          title="编辑"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleStatusToggle(admin)}
                          className={`${admin.status === 1 ? 'text-orange-500 hover:text-orange-700' : 'text-green-600 hover:text-green-800'}`}
                          title={admin.status === 1 ? "禁用" : "启用"}
                        >
                          {admin.status === 1 ? <UserX size={16} /> : <UserCheck size={16} />}
                        </button>
                        <button
                          onClick={() => setDeleteConfirmState({ isOpen: true, adminId: admin.id })}
                          className="text-red-600 hover:text-red-900"
                          title="删除"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg shadow-sm border">
         <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setPagination({ ...pagination, current: Math.max(1, pagination.current - 1) })}
              disabled={pagination.current === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100"
            >
              上一页
            </button>
            <button
              onClick={() => setPagination({ ...pagination, current: pagination.current + 1 })}
              disabled={pagination.current * pagination.size >= total}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100"
            >
              下一页
            </button>
         </div>
         <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                共 <span className="font-medium">{total}</span> 条记录
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => setPagination({ ...pagination, current: Math.max(1, pagination.current - 1) })}
                  disabled={pagination.current === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                  {pagination.current}
                </span>
                <button
                  onClick={() => setPagination({ ...pagination, current: pagination.current + 1 })}
                  disabled={pagination.current * pagination.size >= total}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100"
                >
                  <ChevronRight size={16} />
                </button>
              </nav>
            </div>
         </div>
      </div>

      <AdminModal
        isOpen={modalState.isOpen}
        type={modalState.type}
        admin={modalState.selectedAdmin}
        onClose={() => setModalState({ isOpen: false, type: 'create', selectedAdmin: undefined })}
        onSubmit={handleModalSubmit}
      />

      <ConfirmDialog
        isOpen={deleteConfirmState.isOpen}
        title="确认删除管理员"
        message="确定要删除该管理员吗？该操作不可恢复。"
        onConfirm={executeDelete}
        onCancel={() => setDeleteConfirmState({ isOpen: false, adminId: null })}
      />
    </div>
  );
};
