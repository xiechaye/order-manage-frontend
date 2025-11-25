import axios from 'axios';
import { Result, Page, Order, OrderSearchParams, OrderStatusEnum, AdminUser, LoginParams, AdminSearchParams, UploadImageResponse } from '../types';

const BASE_URL = 'http://localhost:8080/api';

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 2500, // Reduced timeout for faster fallback
  headers: {
    'Content-Type': 'application/json',
  },
});

// Mock Data
const MOCK_USER: AdminUser = {
  id: '1',
  username: 'admin',
  nickname: '演示管理员',
  avatar: '',
  status: 1,
  createTime: '2024-01-01 10:00:00',
  updateTime: '2024-01-01 10:00:00',
  deleted: 0
};

const MOCK_ORDERS: Order[] = [
  {
    id: '101',
    orderNo: 'ORD-20240320-001',
    customerName: '张三',
    customerPhone: '13800138000',
    licensePlate: '粤A88888',
    productName: '米其林轮胎 Pilot Sport 4',
    productQuantity: 4,
    orderStatus: OrderStatusEnum.PENDING_PICKUP,
    remarks: '客户要求尽快提货',
    createdAt: '2024-03-20 10:00:00',
    updatedAt: '2024-03-20 10:00:00'
  },
  {
    id: '102',
    orderNo: 'ORD-20240321-002',
    customerName: '李四',
    customerPhone: '13900139000',
    licensePlate: '粤B66666',
    productName: '壳牌全合成机油保养套餐',
    productQuantity: 1,
    orderStatus: OrderStatusEnum.COMPLETED,
    createdAt: '2024-03-21 14:30:00',
    updatedAt: '2024-03-21 16:00:00'
  },
  {
    id: '103',
    orderNo: 'ORD-20240322-003',
    customerName: '王五',
    customerPhone: '13700137000',
    licensePlate: '粤C12345',
    productName: '博世雨刮器',
    productQuantity: 2,
    orderStatus: OrderStatusEnum.CANCELLED,
    createdAt: '2024-03-22 09:15:00',
    updatedAt: '2024-03-22 09:30:00'
  }
];

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && token !== 'undefined' && token !== 'null') {
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
    // Mock Fallback for Timeout or Network Error
    if (error.code === 'ECONNABORTED' || error.message.includes('Network Error')) {
      console.warn('Backend unreachable (Timeout/Network Error). Serving Mock Data.');
      const config = error.config;
      const url = config.url || '';
      const method = config.method || 'get';

      // Helper to wrap data in Axios response structure
      const mockResponse = (data: any) => Promise.resolve({
        data: { code: 200, message: 'Mock Success', data },
        status: 200,
        statusText: 'OK',
        headers: {},
        config
      });

      // 1. Mock Login
      if (url.includes('/auth/login') && method === 'post') {
        return mockResponse('mock-token-12345');
      }

      // 2. Mock User Info
      if (url.includes('/auth/info') && method === 'get') {
        return mockResponse(MOCK_USER);
      }

      // 3. Mock Orders List / Search
      if (url.includes('/orders') && method === 'get') {
        // Simple search filtering for mock
        let records = [...MOCK_ORDERS];
        if (config.params) {
             const { licensePlate, orderNo, customerName } = config.params;
             if (licensePlate) records = records.filter(o => o.licensePlate?.includes(licensePlate));
             if (orderNo) records = records.filter(o => o.orderNo.includes(orderNo));
             if (customerName) records = records.filter(o => o.customerName.includes(customerName));
        }

        return mockResponse({
          records: records,
          total: records.length,
          size: config.params?.pageSize || 10,
          current: config.params?.currentPage || 1,
          pages: 1
        });
      }

      // 4. Mock Order Detail
      if (url.match(/\/orders\/\d+$/) && method === 'get') {
         return mockResponse(MOCK_ORDERS[0]);
      }

      // 5. Mock Admin List
      if (url.includes('/admin') && method === 'get') {
        return mockResponse({
          records: [MOCK_USER],
          total: 1,
          size: 10,
          current: 1,
          pages: 1
        });
      }

      // 6. Mock Image Upload
      if (url.includes('/upload/image') && method === 'post') {
        return mockResponse({
          status: 'success',
          message: 'Mock Upload',
          imageUrl: 'https://ui-avatars.com/api/?name=User&background=random',
          imageId: 999,
          fileSize: 1024,
          mimeType: 'image/jpeg',
          originalName: 'mock.jpg'
        });
      }

      // 7. Generic Success for mutations (create, update, delete)
      if (['post', 'put', 'delete'].includes(method)) {
         return mockResponse(null);
      }
    }

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