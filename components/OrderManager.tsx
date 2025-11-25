import React, { useEffect, useState, useCallback } from 'react';
import dayjs from 'dayjs';
import { 
  Search, Plus, Eye, Edit2, Trash2, 
  ChevronLeft, ChevronRight, XCircle, CheckCircle, RotateCcw, Filter
} from 'lucide-react';
import { 
  searchOrders, deleteOrder, updateOrderStatus, 
  createOrder, updateOrder 
} from '../services/api';
import { Order, OrderStatusEnum } from '../types';
import { OrderModal } from './OrderModal';
import { ConfirmDialog } from './ConfirmDialog';

// Alert Component
const Alert = ({ type, message, onClose }: { type: 'success' | 'error' | 'warning', message: string, onClose: () => void }) => (
  <div className={`fixed top-4 right-4 z-[70] flex items-center p-4 mb-4 text-sm rounded-lg shadow-lg animate-fade-in-down ${
    type === 'success' ? 'text-green-800 bg-green-50' : 
    type === 'warning' ? 'text-yellow-800 bg-yellow-50' :
    'text-red-800 bg-red-50'
  }`} role="alert">
    <span className="font-medium mr-2">
      {type === 'success' ? '成功！' : type === 'warning' ? '注意！' : '错误！'}
    </span> {message}
    <button onClick={onClose} className="ml-4 hover:opacity-75">
      <XCircle size={16} />
    </button>
  </div>
);

export const OrderManager: React.FC = () => {
  // State
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [pagination, setPagination] = useState({ currentPage: 1, pageSize: 10 });
  const [selectedIds, setSelectedIds] = useState<string[]>([]); // New: Selection State
  
  // Search State
  const [filters, setFilters] = useState({
    orderNo: '',
    customerName: '',
    licensePlate: '',
    orderStatus: '' as unknown as OrderStatusEnum | '',
    startDate: '',
    endDate: ''
  });
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const [activeQuery, setActiveQuery] = useState(filters);

  // Modal State
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: 'create' | 'edit' | 'view';
    selectedOrder?: Order;
  }>({ isOpen: false, type: 'create' });

  // Delete Confirmation State - Updated to support Batch
  const [deleteConfirmState, setDeleteConfirmState] = useState<{
    isOpen: boolean;
    orderId: string | null;
    isBatch?: boolean;
  }>({ isOpen: false, orderId: null, isBatch: false });

  // Notification State
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'warning', message: string } | null>(null);

  const showNotification = (type: 'success' | 'error' | 'warning', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  // Fetch Data
  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await searchOrders({
        currentPage: pagination.currentPage,
        pageSize: pagination.pageSize,
        ...activeQuery
      });
      
      if (res.code === 200 && res.data) {
        setOrders(res.data.records);
        setTotal(res.data.total);
        setSelectedIds([]); // Clear selection on refresh
      } else {
        showNotification('error', res.message || '获取订单失败');
        setOrders([]);
        setTotal(0);
      }
    } catch (error) {
      showNotification('error', '网络请求失败');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [pagination, activeQuery]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Handlers
  const handleSearch = () => {
    setActiveQuery(filters);
    setPagination({ ...pagination, currentPage: 1 });
    setShowMobileFilters(false);
  };

  const handleReset = () => {
    const emptyFilters = {
      orderNo: '',
      customerName: '',
      licensePlate: '',
      orderStatus: '' as unknown as OrderStatusEnum | '',
      startDate: '',
      endDate: ''
    };
    setFilters(emptyFilters);
    setActiveQuery(emptyFilters);
    setPagination({ ...pagination, currentPage: 1 });
  };

  // Selection Handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(orders.map(o => o.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(prev => prev.filter(i => i !== id));
    } else {
      setSelectedIds(prev => [...prev, id]);
    }
  };

  const handleBatchDeleteClick = () => {
    if (selectedIds.length === 0) return;
    setDeleteConfirmState({ isOpen: true, orderId: null, isBatch: true });
  };

  const handleDeleteClick = (id: string) => {
    setDeleteConfirmState({ isOpen: true, orderId: id, isBatch: false });
  };

  const executeDelete = async () => {
    // Batch Delete Logic
    if (deleteConfirmState.isBatch) {
      try {
        // Execute all deletes in parallel
        const deletePromises = selectedIds.map(id => deleteOrder(id));
        const results = await Promise.allSettled(deletePromises);
        
        // Count successes (code 200)
        const successCount = results.filter(r => r.status === 'fulfilled' && r.value.code === 200).length;
        const failCount = results.length - successCount;

        if (successCount > 0) {
          showNotification(failCount > 0 ? 'warning' : 'success', `成功删除 ${successCount} 个订单${failCount > 0 ? `，失败 ${failCount} 个` : ''}`);
          loadOrders(); // Reload to reflect changes
        } else {
          showNotification('error', '所选订单删除失败');
        }
      } catch (error) {
        showNotification('error', '批量删除请求异常');
      } finally {
        setDeleteConfirmState({ isOpen: false, orderId: null, isBatch: false });
      }
      return;
    }

    // Single Delete Logic
    if (deleteConfirmState.orderId === null) return;
    try {
      const res = await deleteOrder(deleteConfirmState.orderId);
      if (res.code === 200) {
        showNotification('success', '订单删除成功');
        loadOrders();
      } else {
        showNotification('error', res.message || '删除订单失败');
      }
    } catch (error) {
      showNotification('error', '删除请求失败');
    } finally {
      setDeleteConfirmState({ isOpen: false, orderId: null, isBatch: false });
    }
  };

  const handleStatusChange = async (id: string, status: OrderStatusEnum) => {
    try {
      const res = await updateOrderStatus(id, status);
      if (res.code === 200) {
        showNotification('success', '状态已更新');
        loadOrders();
      } else {
        showNotification('error', res.message || '更新状态失败');
      }
    } catch (error) {
      showNotification('error', '更新请求失败');
    }
  };

  const handleModalSubmit = async (data: Partial<Order>) => {
    try {
      let res;
      if (modalState.type === 'create') {
        res = await createOrder(data);
        if (res.code === 200) {
          showNotification('success', '订单创建成功');
        } else {
          throw new Error(res.message);
        }
      } else if (modalState.type === 'edit' && modalState.selectedOrder) {
        res = await updateOrder(modalState.selectedOrder.id, data);
         if (res.code === 200) {
          showNotification('success', '订单更新成功');
        } else {
          throw new Error(res.message);
        }
      }
      loadOrders();
    } catch (error: any) {
      showNotification('error', error.message || '操作失败');
      throw error; 
    }
  };

  const getStatusBadge = (status: OrderStatusEnum) => {
    switch (status) {
      case OrderStatusEnum.PENDING_PICKUP:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning/10 text-warning border border-warning/20">待提货</span>;
      case OrderStatusEnum.COMPLETED:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success border border-success/20">已完成</span>;
      case OrderStatusEnum.CANCELLED:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-danger/10 text-danger border border-danger/20">已取消</span>;
      default:
        return null;
    }
  };

  const renderActionButtons = (order: Order, size: number = 18) => (
    <div className="flex items-center gap-4 md:gap-3">
      <button
        onClick={() => setModalState({ isOpen: true, type: 'view', selectedOrder: order })}
        className="text-gray-400 hover:text-primary tooltip p-1 md:p-0"
        title="查看"
      >
        <Eye size={size} />
      </button>
      
      <button
        onClick={() => setModalState({ isOpen: true, type: 'edit', selectedOrder: order })}
        className="text-gray-400 hover:text-primary tooltip p-1 md:p-0"
        title="编辑"
      >
        <Edit2 size={size} />
      </button>
      
      {order.orderStatus === OrderStatusEnum.PENDING_PICKUP && (
        <>
          <button
            onClick={() => handleStatusChange(order.id, OrderStatusEnum.COMPLETED)}
            className="text-success hover:text-success/80 tooltip p-1 md:p-0"
            title="完成订单"
          >
            <CheckCircle size={size} />
          </button>
          <button
            onClick={() => handleStatusChange(order.id, OrderStatusEnum.CANCELLED)}
            className="text-warning hover:text-warning/80 tooltip p-1 md:p-0"
            title="取消订单"
          >
            <XCircle size={size} />
          </button>
        </>
      )}

      <button
        onClick={() => handleDeleteClick(order.id)}
        className="text-gray-400 hover:text-danger tooltip p-1 md:p-0"
        title="删除"
      >
        <Trash2 size={size} />
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      {notification && <Alert type={notification.type} message={notification.message} onClose={() => setNotification(null)} />}
      
      {/* Page Local Header with Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
         <div className="md:hidden w-full">
            <button 
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="w-full flex items-center justify-center gap-2 bg-gray-50 p-2 rounded border border-gray-200 text-gray-700 font-medium text-sm"
            >
              <Filter size={16} />
              {showMobileFilters ? '收起搜索' : '展开搜索'}
            </button>
         </div>
         <div className="hidden md:flex items-center gap-2 text-gray-500 text-sm">
            <span>管理所有订单信息</span>
            {selectedIds.length > 0 && (
               <span className="ml-2 px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium border border-blue-100">
                 已选择 {selectedIds.length} 项
               </span>
            )}
         </div>
         <div className="flex w-full sm:w-auto gap-3">
            {selectedIds.length > 0 && (
              <button
                onClick={handleBatchDeleteClick}
                className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 transition-all animate-fade-in-up"
              >
                <Trash2 size={18} className="mr-2" />
                批量删除 ({selectedIds.length})
              </button>
            )}
            <button
              onClick={() => setModalState({ isOpen: true, type: 'create' })}
              className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:opacity-90 transition-all"
            >
              <Plus size={18} className="mr-2" />
              新建订单
            </button>
         </div>
      </div>

      {/* Search Toolbar */}
      <div className={`bg-white p-5 rounded-lg shadow-sm border border-gray-200 ${showMobileFilters ? 'block' : 'hidden'} md:block`}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">订单编号</label>
              <input
                type="text"
                value={filters.orderNo}
                onChange={(e) => setFilters({...filters, orderNo: e.target.value})}
                placeholder="请输入订单编号"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-primary focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">客户姓名</label>
              <input
                type="text"
                value={filters.customerName}
                onChange={(e) => setFilters({...filters, customerName: e.target.value})}
                placeholder="请输入客户姓名"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-primary focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">车牌号</label>
              <input
                type="text"
                value={filters.licensePlate}
                onChange={(e) => setFilters({...filters, licensePlate: e.target.value})}
                placeholder="请输入车牌号"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-primary focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">订单状态</label>
              <select
                value={filters.orderStatus}
                onChange={(e) => setFilters({...filters, orderStatus: e.target.value === '' ? '' : Number(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-primary focus:border-primary"
              >
                <option value="">全部状态</option>
                <option value={OrderStatusEnum.PENDING_PICKUP}>待提货</option>
                <option value={OrderStatusEnum.COMPLETED}>已完成</option>
                <option value={OrderStatusEnum.CANCELLED}>已取消</option>
              </select>
            </div>
            <div className="lg:col-span-2">
              <label className="block text-xs font-medium text-gray-500 mb-1">创建时间</label>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-primary focus:border-primary"
                />
                <span className="text-gray-400">-</span>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-primary focus:border-primary"
                />
              </div>
            </div>
            <div className="lg:col-span-2 flex items-end gap-3">
              <button
                onClick={handleSearch}
                className="flex-1 lg:flex-none inline-flex justify-center items-center px-5 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                <Search size={16} className="mr-2" />
                查询
              </button>
              <button
                onClick={handleReset}
                className="flex-1 lg:flex-none inline-flex justify-center items-center px-5 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                <RotateCcw size={16} className="mr-2" />
                重置
              </button>
            </div>
          </div>
      </div>

      {loading && (
           <div className="bg-white p-12 text-center text-gray-500 rounded-lg shadow-sm border border-gray-200">
             <div className="flex justify-center items-center gap-2">
               <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
               加载订单中...
             </div>
           </div>
      )}

      {!loading && orders.length === 0 && (
          <div className="bg-white p-12 text-center text-gray-500 rounded-lg shadow-sm border border-gray-200">
            暂无订单数据。
          </div>
      )}

      {!loading && orders.length > 0 && (
          <>
            <div className="hidden md:block bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left">
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                          checked={selectedIds.length > 0 && selectedIds.length === orders.length}
                          onChange={handleSelectAll}
                        />
                      </th>
                      {['订单编号', '客户信息', '产品名称', '数量', '状态', '创建时间', '操作'].map((header) => (
                        <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map((order) => (
                      <tr key={order.id} className={`hover:bg-gray-50 transition-colors ${selectedIds.includes(order.id) ? 'bg-blue-50/50' : ''}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                            checked={selectedIds.includes(order.id)}
                            onChange={() => handleSelectRow(order.id)}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.orderNo}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-900">{order.customerName}</span>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              <span className="text-xs text-gray-500">{order.customerPhone}</span>
                              {order.licensePlate && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                                  {order.licensePlate}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.productName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.productQuantity}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(order.orderStatus)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.createdAt}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {renderActionButtons(order)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {orders.map((order) => (
                <div key={order.id} className={`bg-white p-4 rounded-lg shadow-sm border ${selectedIds.includes(order.id) ? 'border-primary ring-1 ring-primary' : 'border-gray-200'}`}>
                  <div className="flex justify-between items-start mb-3 border-b border-gray-50 pb-2">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        className="mt-1 w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                        checked={selectedIds.includes(order.id)}
                        onChange={() => handleSelectRow(order.id)}
                      />
                      <div>
                        <div className="text-sm font-bold text-gray-900 flex items-center gap-2">
                          {order.orderNo}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">{order.createdAt}</div>
                      </div>
                    </div>
                    {getStatusBadge(order.orderStatus)}
                  </div>
                  <div className="space-y-3 mb-4 pl-7">
                    <div className="text-sm">
                        <div className="text-xs font-medium text-gray-500 mb-0.5">客户信息</div>
                        <div className="text-gray-900 flex flex-wrap gap-2 items-center">
                          <span className="font-medium">{order.customerName}</span>
                          <span className="text-gray-300">|</span>
                          <span className="text-gray-600">{order.customerPhone}</span>
                          {order.licensePlate && (
                              <span className="bg-gray-100 px-1.5 py-0.5 rounded text-xs border border-gray-200 text-gray-600">
                                {order.licensePlate}
                              </span>
                          )}
                        </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-1 text-sm">
                        <div className="text-xs font-medium text-gray-500 mb-0.5">产品</div>
                        <div className="text-gray-900">{order.productName}</div>
                      </div>
                      <div className="text-sm">
                        <div className="text-xs font-medium text-gray-500 mb-0.5">数量</div>
                        <div className="text-gray-900 font-medium text-right">{order.productQuantity}</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end pt-2 border-t border-gray-100">
                    {renderActionButtons(order, 20)}
                  </div>
                </div>
              ))}
            </div>
          </>
      )}

      {/* Pagination */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between w-full sm:hidden">
            <button
              onClick={() => setPagination({ ...pagination, currentPage: Math.max(1, pagination.currentPage - 1) })}
              disabled={pagination.currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100"
            >
              上一页
            </button>
            <span className="text-sm text-gray-700">
              {pagination.currentPage} / {Math.ceil(total / pagination.pageSize) || 1}
            </span>
            <button
              onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage + 1 })}
              disabled={pagination.currentPage * pagination.pageSize >= total}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100"
            >
              下一页
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                显示第 <span className="font-medium">{(pagination.currentPage - 1) * pagination.pageSize + 1}</span> 到 <span className="font-medium">{Math.min(pagination.currentPage * pagination.pageSize, total)}</span> 条，共 <span className="font-medium">{total}</span> 条
              </p>
            </div>
            <div className="flex gap-2 items-center">
               <select
                  value={pagination.pageSize}
                  onChange={(e) => setPagination({ ...pagination, pageSize: Number(e.target.value), currentPage: 1 })}
                  className="mr-4 border-gray-300 rounded-md text-sm py-1"
               >
                  <option value={10}>10 条/页</option>
                  <option value={20}>20 条/页</option>
                  <option value={50}>50 条/页</option>
               </select>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => setPagination({ ...pagination, currentPage: Math.max(1, pagination.currentPage - 1) })}
                  disabled={pagination.currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                  {pagination.currentPage}
                </span>
                <button
                  onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage + 1 })}
                  disabled={pagination.currentPage * pagination.pageSize >= total}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100"
                >
                  <ChevronRight size={16} />
                </button>
              </nav>
            </div>
          </div>
        </div>
      
      <OrderModal
        isOpen={modalState.isOpen}
        type={modalState.type}
        order={modalState.selectedOrder}
        onClose={() => setModalState({ isOpen: false, type: 'create', selectedOrder: undefined })}
        onSubmit={handleModalSubmit}
      />
      
      <ConfirmDialog 
        isOpen={deleteConfirmState.isOpen}
        title={deleteConfirmState.isBatch ? "确认批量删除" : "确认删除订单"}
        message={deleteConfirmState.isBatch 
          ? `您确定要删除选中的 ${selectedIds.length} 个订单吗？此操作无法撤销。` 
          : "您确定要永久删除此订单吗？此操作无法撤销。"}
        confirmText="删除"
        cancelText="取消"
        onConfirm={executeDelete}
        onCancel={() => setDeleteConfirmState({ isOpen: false, orderId: null, isBatch: false })}
      />
    </div>
  );
};