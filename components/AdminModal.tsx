
import React, { useEffect, useState, useRef } from 'react';
import { AdminUser } from '../types';
import { X, Save, Upload, Image as ImageIcon, Loader2 } from 'lucide-react';
import { uploadImage, getImageUrl } from '../services/api';

interface AdminModalProps {
  isOpen: boolean;
  type: 'create' | 'edit';
  admin?: AdminUser;
  onClose: () => void;
  onSubmit: (data: Partial<AdminUser> & { password?: string }) => Promise<void>;
}

export const AdminModal: React.FC<AdminModalProps> = ({ isOpen, type, admin, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<Partial<AdminUser> & { password?: string }>({
    username: '',
    nickname: '',
    password: '',
    avatar: '',
    status: 1
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (type === 'create') {
        setFormData({ username: '', nickname: '', password: '', avatar: '', status: 1 });
      } else if (admin) {
        setFormData({ ...admin, password: '' }); // Don't fill password on edit
      }
      setErrors({});
    }
  }, [isOpen, type, admin]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (type === 'create' && !formData.username?.trim()) newErrors.username = '请输入用户名';
    if (type === 'create' && !formData.password?.trim()) newErrors.password = '请输入密码';
    if (!formData.nickname?.trim()) newErrors.nickname = '请输入昵称';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setSubmitting(true);
      try {
        await onSubmit(formData);
        onClose();
      } catch (err) {
        console.error(err);
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const res = await uploadImage(file);
      if (res.code === 200 && res.data) {
        // We store the imageUrl returned by backend. 
        // Note: The backend returns /uploads/images/xxx.jpg. 
        // We will store this and resolve it using getImageUrl when displaying.
        setFormData(prev => ({ ...prev, avatar: res.data!.imageUrl }));
      } else {
        console.error('Upload failed', res.message);
        alert(`上传失败: ${res.message}`);
      }
    } catch (error) {
      console.error('Upload error', error);
      alert('上传发生错误');
    } finally {
      setUploading(false);
      // Reset input so same file can be selected again if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">{type === 'create' ? '新增管理员' : '编辑管理员'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">用户名 {type === 'create' && <span className="text-danger">*</span>}</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              disabled={type === 'edit'}
              className={`${inputClass} ${type === 'edit' ? 'bg-gray-100 text-gray-500' : ''}`}
            />
            {errors.username && <p className="text-danger text-xs mt-1">{errors.username}</p>}
          </div>

          {type === 'create' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">密码 <span className="text-danger">*</span></label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={inputClass}
              />
              {errors.password && <p className="text-danger text-xs mt-1">{errors.password}</p>}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">昵称 <span className="text-danger">*</span></label>
            <input
              type="text"
              value={formData.nickname}
              onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
              className={inputClass}
            />
            {errors.nickname && <p className="text-danger text-xs mt-1">{errors.nickname}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">头像</label>
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                {uploading ? (
                  <Loader2 className="animate-spin text-primary" size={24} />
                ) : formData.avatar ? (
                  <img 
                    src={getImageUrl(formData.avatar)} 
                    alt="Avatar Preview" 
                    className="w-full h-full object-cover" 
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = ''; // Clear broken link
                      (e.target as HTMLImageElement).parentElement?.classList.add('bg-gray-100'); // Fallback style
                    }}
                  />
                ) : (
                  <ImageIcon className="text-gray-400" size={24} />
                )}
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
                >
                  <Upload size={16} className="mr-2" />
                  {uploading ? '上传中...' : '上传图片'}
                </button>
                <p className="mt-1 text-xs text-gray-500">支持 JPG, PNG, GIF. 最大 2MB.</p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: Number(e.target.value) })}
              className={inputClass}
            >
              <option value={1}>启用</option>
              <option value={0}>禁用</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={submitting || uploading}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
            >
              <Save size={16} />
              {submitting ? '保存中...' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
