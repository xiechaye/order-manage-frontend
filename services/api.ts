
import axios from 'axios';
import { Result, Page, Order, OrderSearchParams, OrderStatusEnum, AdminUser, LoginParams, AdminSearchParams, UploadImageResponse } from '../types';

const BASE_URL = 'http://localhost:8080/api';

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      if (!config.headers) {
        config.headers = {} as any;
      }
      (config.headers as any)['Authorization'] = `Bearer ${token}`;
      (config.headers as any)['satoken'] = token;
      (config.headers as any)['token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
    return Promise.reject(error);
  }
);

// --- Auth Modules ---
export const login = async (data: LoginParams) => {
  const response = await apiClient.post<Result<string>>('/auth/login', data);
  return response.data;
};

export const logout = async () => {
  const response = await apiClient.post<Result<null>>('/auth/logout');
  return response.data;
};

export const getUserInfo = async () => {
  const response = await apiClient.get<Result<AdminUser>>('/auth/info');
  return response.data;
};

// --- Order Modules ---
export const getOrders = async (params: { currentPage: number; pageSize: number; keyword?: string }) => {
  const response = await apiClient.get<Result<Page<Order>>>('/orders', { params });
  return response.data;
};

export const searchOrders = async (params: OrderSearchParams) => {
  const response = await apiClient.get<Result<Page<Order>>>('/orders/search', { params });
  return response.data;
};

export const getOrder = async (id: string) => {
  const response = await apiClient.get<Result<Order>>(`/orders/${id}`);
  return response.data;
};

export const createOrder = async (order: Partial<Order>) => {
  const response = await apiClient.post<Result<Order>>('/orders', order);
  return response.data;
};

export const updateOrder = async (id: string, order: Partial<Order>) => {
  const response = await apiClient.put<Result<Order>>(`/orders/${id}`, order);
  return response.data;
};

export const deleteOrder = async (id: string) => {
  const response = await apiClient.delete<Result<null>>(`/orders/${id}`);
  return response.data;
};

export const updateOrderStatus = async (id: string, status: OrderStatusEnum) => {
  const response = await apiClient.put<Result<null>>(`/orders/${id}/status`, {
    orderStatus: status
  });
  return response.data;
};

// --- Admin Modules ---
export const getAdmins = async (params: AdminSearchParams) => {
  const response = await apiClient.get<Result<Page<AdminUser>>>('/admin', { params });
  return response.data;
};

export const createAdmin = async (admin: Partial<AdminUser> & { password?: string }) => {
  const response = await apiClient.post<Result<AdminUser>>('/admin', admin);
  return response.data;
};

export const updateAdmin = async (id: string, admin: Partial<AdminUser>) => {
  const response = await apiClient.put<Result<AdminUser>>(`/admin/${id}`, admin);
  return response.data;
};

export const deleteAdmin = async (id: string) => {
  const response = await apiClient.delete<Result<null>>(`/admin/${id}`);
  return response.data;
};

export const updateAdminStatus = async (id: string, status: number) => {
  const response = await apiClient.put<Result<null>>(`/admin/${id}/status`, null, {
    params: { status },
  });
  return response.data;
};

// --- Upload Modules ---
export const uploadImage = async (file: File) => {
  const formData = new FormData();
  formData.append('image', file);
  const response = await apiClient.post<Result<UploadImageResponse>>('/upload/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    }
  });
  return response.data;
};

export const deleteImage = async (imageId: number) => {
  const response = await apiClient.delete<Result<null>>(`/upload/image/${imageId}`);
  return response.data;
};

// Helper to construct image URL
export const getImageUrl = (fileNameOrPath?: string) => {
  if (!fileNameOrPath) return '';
  if (fileNameOrPath.startsWith('http') || fileNameOrPath.startsWith('https')) return fileNameOrPath;
  
  // Extract filename from path (e.g., /uploads/images/photo.jpg -> photo.jpg)
  const parts = fileNameOrPath.split('/');
  const fileName = parts[parts.length - 1];
  
  // Return the API endpoint to fetch the image
  return `${BASE_URL}/upload/image/${fileName}`;
};
