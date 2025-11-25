
export enum OrderStatusEnum {
  PENDING_PICKUP = 0,
  COMPLETED = 1,
  CANCELLED = 2
}

export interface Order {
  id: string;
  orderNo: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  licensePlate?: string;
  productName: string;
  productQuantity: number;
  orderStatus: OrderStatusEnum;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUser {
  id: string;
  username: string;
  nickname: string;
  avatar?: string;
  status: number; // 1 enabled, 0 disabled
  createTime: string;
  updateTime: string;
  deleted: number;
}

export interface LoginParams {
  username: string;
  password?: string;
}

export interface Page<T> {
  records: T[];
  total: number;
  size: number;
  current: number;
  pages: number;
}

export interface Result<T> {
  code: number;
  message: string;
  data: T | null;
}

export interface OrderSearchParams {
  currentPage: number;
  pageSize: number;
  keyword?: string;
  orderNo?: string;
  customerName?: string;
  licensePlate?: string;
  orderStatus?: OrderStatusEnum | '';
  startDate?: string;
  endDate?: string;
}

export interface AdminSearchParams {
  current: number;
  size: number;
  username?: string;
}

export interface UploadImageResponse {
  status: string;
  message: string;
  imageUrl: string;
  imageId: number;
  fileSize: number;
  mimeType: string;
  originalName: string;
}
